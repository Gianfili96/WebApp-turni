import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProfiloAdminDialogComponent } from './profilo-admin-dialog';

describe('ProfiloAdminDialog', () => {
  let component: ProfiloAdminDialogComponent;
  let fixture: ComponentFixture<ProfiloAdminDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProfiloAdminDialogComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ProfiloAdminDialogComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
