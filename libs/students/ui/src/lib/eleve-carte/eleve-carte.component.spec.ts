import 'jest-preset-angular/setup-jest';
import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { QRCodeModule } from 'angularx-qrcode';
import { IStudentCard, WorkspaceType } from '@sms/shared/models';
import { EleveCarteComponent } from './eleve-carte.component';

// Stub du QR pour éviter le rendu canvas sous jsdom
@Component({ selector: 'qrcode', standalone: true, template: '' })
class QrcodeStub {}

const baseCard: IStudentCard = {
  matricule: 'ML-LY-2026-E0001-A1B2C3D4',
  nom: 'Touré',
  prenom: 'Ibrahim',
  etablissementNom: 'Lycée Horizon',
  workspaceType: WorkspaceType.LYCEUM,
  groupeLibelle: 'Terminale D',
  anneeAcademique: '2025-2026',
  dateEmission: '2026-06-29',
};

describe('EleveCarteComponent', () => {
  let fixture: ComponentFixture<EleveCarteComponent>;

  async function render(card: IStudentCard) {
    await TestBed.configureTestingModule({
      imports: [EleveCarteComponent],
    })
      .overrideComponent(EleveCarteComponent, {
        remove: { imports: [QRCodeModule] },
        add: { imports: [QrcodeStub] },
      })
      .compileComponents();

    fixture = TestBed.createComponent(EleveCarteComponent);
    fixture.componentRef.setInput('card', card);
    fixture.detectChanges();
    return fixture.nativeElement as HTMLElement;
  }

  it('affiche « Carte Élève » pour un Lycée', async () => {
    const el = await render(baseCard);
    expect(el.querySelector('.sms-card-type')?.textContent).toContain('Élève');
    expect(el.querySelector('.sms-card-name')?.textContent).toContain('Ibrahim Touré');
  });

  it('affiche « Carte Étudiant » pour une Université (piloté par workspaceType)', async () => {
    const el = await render({ ...baseCard, workspaceType: WorkspaceType.UNIVERSITY });
    expect(el.querySelector('.sms-card-type')?.textContent).toContain('Étudiant');
  });

  it('affiche le matricule', async () => {
    const el = await render(baseCard);
    expect(el.textContent).toContain('ML-LY-2026-E0001-A1B2C3D4');
  });

  it('imprimer() déclenche window.print()', async () => {
    await render(baseCard);
    const printSpy = jest.spyOn(window, 'print').mockImplementation(() => undefined);
    fixture.componentInstance.imprimer();
    expect(printSpy).toHaveBeenCalled();
    printSpy.mockRestore();
  });
});
