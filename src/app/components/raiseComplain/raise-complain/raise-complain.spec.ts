import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RaiseComplain } from './raise-complain';

describe('RaiseComplain', () => {
  let component: RaiseComplain;
  let fixture: ComponentFixture<RaiseComplain>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RaiseComplain],
    }).compileComponents();

    fixture = TestBed.createComponent(RaiseComplain);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
