import 'jest-preset-angular/setup-jest';
import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { AuthStore } from './auth.store';
import { UserApiService } from '../services/user-api.service';
import { ICurrentUser, Role } from '@sms/shared/models';

const mockUser: ICurrentUser = {
  sub:               'keycloak-uuid-123',
  email:             'directeur@sms.ci',
  firstName:         'Mamadou',
  lastName:          'Coulibaly',
  role:              Role.DIR,
  etablissementId:   1,
  anneeAcademiqueId: 0,
  smsUserId:         0,
};

describe('AuthStore', () => {
  let store: InstanceType<typeof AuthStore>;
  let userApiSpy: jest.Mocked<UserApiService>;

  beforeEach(() => {
    userApiSpy = { getMyAccount: jest.fn() } as unknown as jest.Mocked<UserApiService>;

    TestBed.configureTestingModule({
      providers: [
        { provide: UserApiService, useValue: userApiSpy },
      ],
    });

    store = TestBed.inject(AuthStore);
  });

  it('should start unauthenticated', () => {
    expect(store.isAuthenticated()).toBe(false);
    expect(store.currentUser()).toBeNull();
  });

  it('loadCurrentUser — sets user and marks authenticated', () => {
    userApiSpy.getMyAccount.mockReturnValue(of(mockUser));

    store.loadCurrentUser();

    expect(store.isAuthenticated()).toBe(true);
    expect(store.currentUser()).toEqual(mockUser);
    expect(store.userRole()).toBe(Role.DIR);
    expect(store.etablissementId()).toBe(1);
  });

  it('loadCurrentUser — on API error, stays unauthenticated', () => {
    userApiSpy.getMyAccount.mockReturnValue(throwError(() => new Error('network')));

    store.loadCurrentUser();

    expect(store.isAuthenticated()).toBe(false);
    expect(store.currentUser()).toBeNull();
  });

  it('setCurrentUser — populates store directly', () => {
    store.setCurrentUser(mockUser);

    expect(store.isAuthenticated()).toBe(true);
    expect(store.etablissementId()).toBe(1);
    expect(store.userRole()).toBe(Role.DIR);
  });

  it('clearCurrentUser — resets to initial state', () => {
    store.setCurrentUser(mockUser);
    store.clearCurrentUser();

    expect(store.isAuthenticated()).toBe(false);
    expect(store.currentUser()).toBeNull();
  });

  it('requires2Fa — true for ADMIN, DIR, COMPTABLE, ENSEIGNANT', () => {
    store.setCurrentUser({ ...mockUser, role: Role.ADMIN });
    expect(store.requires2Fa()).toBe(true);

    store.setCurrentUser({ ...mockUser, role: Role.DIR });
    expect(store.requires2Fa()).toBe(true);

    store.setCurrentUser({ ...mockUser, role: Role.COMPTABLE });
    expect(store.requires2Fa()).toBe(true);

    store.setCurrentUser({ ...mockUser, role: Role.ENSEIGNANT });
    expect(store.requires2Fa()).toBe(true);
  });

  it('requires2Fa — false for SECRETARIAT, PARENT, ELEVE', () => {
    store.setCurrentUser({ ...mockUser, role: Role.SECRETARIAT });
    expect(store.requires2Fa()).toBe(false);

    store.setCurrentUser({ ...mockUser, role: Role.PARENT });
    expect(store.requires2Fa()).toBe(false);

    store.setCurrentUser({ ...mockUser, role: Role.ELEVE });
    expect(store.requires2Fa()).toBe(false);
  });
});
