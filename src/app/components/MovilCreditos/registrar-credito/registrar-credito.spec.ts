import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegistrarCredito } from './registrar-credito';

describe('RegistrarCredito', () => {
  let component: RegistrarCredito;
  let fixture: ComponentFixture<RegistrarCredito>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RegistrarCredito]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RegistrarCredito);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
