import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CambioPassword } from './cambio-password';

describe('CambioPassword', () => {
  let component: CambioPassword;
  let fixture: ComponentFixture<CambioPassword>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CambioPassword],
    }).compileComponents();

    fixture = TestBed.createComponent(CambioPassword);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
