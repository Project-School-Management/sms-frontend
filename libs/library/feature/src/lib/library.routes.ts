import { Routes } from '@angular/router';

export const LIBRARY_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/library-catalog/library-catalog.component').then(m => m.LibraryCatalogComponent),
    title: 'Bibliothèque numérique',
  },
  {
    path: 'resource/:publicId',
    loadComponent: () => import('./pages/resource-detail/resource-detail.component').then(m => m.ResourceDetailComponent),
    title: 'Détail ressource',
  },
  {
    path: 'borrow/:publicId',
    loadComponent: () => import('./pages/borrow/borrow.component').then(m => m.BorrowComponent),
    title: 'Emprunter',
  },
  {
    path: 'reserve/:publicId',
    loadComponent: () => import('./pages/reserve/reserve.component').then(m => m.ReserveComponent),
    title: 'Réserver',
  },
  {
    path: 'read/:publicId',
    loadComponent: () => import('./pages/read/read.component').then(m => m.ReadComponent),
    title: 'Lecture en ligne',
  },
  {
    path: 'manage/new',
    loadComponent: () => import('./pages/resource-form/resource-form.component').then(m => m.ResourceFormComponent),
    title: 'Ajouter une ressource',
  },
  {
    path: 'manage/:publicId/edit',
    loadComponent: () => import('./pages/resource-form/resource-form.component').then(m => m.ResourceFormComponent),
    title: 'Modifier la ressource',
  },
  {
    path: 'my-loans',
    loadComponent: () => import('./pages/my-loans/my-loans.component').then(m => m.MyLoansComponent),
    title: 'Mes emprunts',
  },
  {
    path: 'loan/:publicId',
    loadComponent: () => import('./pages/loan-detail/loan-detail.component').then(m => m.LoanDetailComponent),
    title: 'Détail emprunt',
  },
  {
    path: 'loan-management',
    loadComponent: () => import('./pages/loan-management/loan-management.component').then(m => m.LoanManagementComponent),
    title: 'Gestion des emprunts',
  },
];
