import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UserContactDetailsComponent } from './user-contact-details.component';

describe('UserContactDetailsComponent', () => {
  let component: UserContactDetailsComponent;
  let fixture: ComponentFixture<UserContactDetailsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UserContactDetailsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UserContactDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
