import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DetalleCredito } from './detalle-credito';

describe('DetalleCredito', () => {
  let component: DetalleCredito;
  let fixture: ComponentFixture<DetalleCredito>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DetalleCredito]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DetalleCredito);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
