import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GestioneDipendenti } from './gestione-dipendenti';

describe('GestioneDipendenti', () => {
  let component: GestioneDipendenti;
  let fixture: ComponentFixture<GestioneDipendenti>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GestioneDipendenti],
    }).compileComponents();

    fixture = TestBed.createComponent(GestioneDipendenti);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
