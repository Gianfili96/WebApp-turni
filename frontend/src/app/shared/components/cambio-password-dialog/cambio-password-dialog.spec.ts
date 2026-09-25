import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CambioPasswordDialogComponent } from './cambio-password-dialog';

describe('CambioPasswordDialog', () => {
  let component: CambioPasswordDialogComponent;
  let fixture: ComponentFixture<CambioPasswordDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CambioPasswordDialogComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CambioPasswordDialogComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
