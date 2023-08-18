import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UserViewProfileComponent } from './user-view-profile.component';

describe('UserProfileComponent', () => {
  let component: UserViewProfileComponent;
  let fixture: ComponentFixture<UserViewProfileComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UserViewProfileComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UserViewProfileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
