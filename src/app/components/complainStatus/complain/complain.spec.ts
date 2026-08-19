import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Complain } from './complain';

describe('Complain', () => {
  let component: Complain;
  let fixture: ComponentFixture<Complain>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Complain],
    }).compileComponents();

    fixture = TestBed.createComponent(Complain);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
