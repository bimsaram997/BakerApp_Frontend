import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GoodRecieveNoteComponent } from './good-recieve-note.component';

describe('GoodRecieveNoteComponent', () => {
  let component: GoodRecieveNoteComponent;
  let fixture: ComponentFixture<GoodRecieveNoteComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [GoodRecieveNoteComponent]
    });
    fixture = TestBed.createComponent(GoodRecieveNoteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
