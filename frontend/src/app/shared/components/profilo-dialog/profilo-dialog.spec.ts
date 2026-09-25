import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProfiloDialogComponent } from './profilo-dialog';

describe('ProfiloDialog', () => {
  let component: ProfiloDialogComponent;
  let fixture: ComponentFixture<ProfiloDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProfiloDialogComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ProfiloDialogComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
