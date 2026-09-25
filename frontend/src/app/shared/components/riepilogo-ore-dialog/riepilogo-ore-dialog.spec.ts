import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RiepilogoOreDialogComponent } from './riepilogo-ore-dialog';

describe('RiepilogoOreDialog', () => {
  let component: RiepilogoOreDialogComponent;
  let fixture: ComponentFixture<RiepilogoOreDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RiepilogoOreDialogComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(RiepilogoOreDialogComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
