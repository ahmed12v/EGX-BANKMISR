import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Searching } from './searching';

describe('Searching', () => {
  let component: Searching;
  let fixture: ComponentFixture<Searching>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Searching],
    }).compileComponents();

    fixture = TestBed.createComponent(Searching);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
