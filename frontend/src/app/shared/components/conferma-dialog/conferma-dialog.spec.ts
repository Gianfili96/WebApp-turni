import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfermaDialogComponent } from './conferma-dialog';

describe('ConfermaDialogComponent', () => {
  let component: ConfermaDialogComponent;
  let fixture: ComponentFixture<ConfermaDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConfermaDialogComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ConfermaDialogComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
