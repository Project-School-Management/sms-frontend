// ── Public API — @sms/shared/auth ────────────────────────────────────────────
export { AuthStore }         from './lib/store/auth.store';
export { EspaceStore }       from './lib/store/espace.store';
export { AuthService }       from './lib/services/auth.service';
export { EspaceApiService }  from './lib/services/espace-api.service';
export { authGuard }         from './lib/guards/auth.guard';
export { roleGuard }         from './lib/guards/role.guard';
export { twoFaGuard }        from './lib/guards/two-fa.guard';
export { espaceGuard }       from './lib/guards/espace.guard';
export { authInterceptor }   from './lib/interceptors/auth.interceptor';
export { tenantInterceptor } from './lib/interceptors/tenant.interceptor';
export { errorInterceptor }  from './lib/interceptors/error.interceptor';
