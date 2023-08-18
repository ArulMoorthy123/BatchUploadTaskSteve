import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FilterChatComponent } from './filter-chat.component';

describe('FilterChatComponent', () => {
  let component: FilterChatComponent;
  let fixture: ComponentFixture<FilterChatComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FilterChatComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FilterChatComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
