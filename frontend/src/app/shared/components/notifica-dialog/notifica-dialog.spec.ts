import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NotificaDialogComponent } from './notifica-dialog';

describe('NotificaDialog', () => {
  let component: NotificaDialogComponent;
  let fixture: ComponentFixture<NotificaDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NotificaDialogComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(NotificaDialogComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
