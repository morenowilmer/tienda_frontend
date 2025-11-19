import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { PersonaService } from '../core/services/persona.service';
import { NotificationService } from '../core/services/notification.service';
import { TipoDocumento } from '../core/model/persona.model';
import { FacturaService } from '../core/services/factura.service';
import { Factura } from '../core/model/factura.model';

@Component({
  standalone: true,
  selector: 'app-factura',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './factura.component.html',
  styleUrls: ['./factura.component.css'],
})
export class FacturaComponent implements OnInit {
  formularioBusquedaPersona: FormGroup;
  formularioBusquedaFactura: FormGroup;

  tiposDocumento: TipoDocumento[] = [];
  facturasCliente: Factura[] = [];
  personaEncontrada: any | null = null;

  rawXml: string = '';
  prettyXml: string = '';
  xmlGenerated = false;
  parsedXml: any[] = [];

  constructor(
    private fb: FormBuilder,
    private personaService: PersonaService,
    private facturaService: FacturaService,
    private notificacionService: NotificationService
  ) {
    this.formularioBusquedaPersona = this.fb.group({
      tipoDocumento: ['', [Validators.required]],
      identificacion: ['', [Validators.required, Validators.maxLength(30)]],
    });
    this.formularioBusquedaFactura = this.fb.group({
      idFactura: ['', [Validators.required]],
    });
  }

  ngOnInit(): void {
    this.cargarTiposDocumentos();
  }

  get fbp() {
    return this.formularioBusquedaPersona.controls;
  }

  get fbf() {
    return this.formularioBusquedaFactura.controls;
  }

  cargarTiposDocumentos(): void {
    this.personaService.tiposDocumentos().subscribe({
      next: (res: any) => {
        this.tiposDocumento = res && res.respuesta ? res.respuesta : [];
      },
      error: () => {
        this.tiposDocumento = [];
        this.notificacionService.showError(
          'Error al cargar tipos de documento'
        );
      },
    });
  }

  buscarPersona(): void {
    if (this.formularioBusquedaPersona.invalid) {
      this.formularioBusquedaPersona.markAllAsTouched();
      return;
    }
    const tipoDocumento =
      this.formularioBusquedaPersona.get('tipoDocumento')?.value;
    const identificacion =
      this.formularioBusquedaPersona.get('identificacion')?.value;
    this.personaService
      .consultarPersona(tipoDocumento, identificacion)
      .subscribe({
        next: (res: any) => {
          if (res && res.respuesta) {
            this.personaEncontrada = res.respuesta;
            this.buscarFacturasCliente(this.personaEncontrada.id);
          } else {
            this.notificacionService.showError(
              res?.mensaje ?? 'Persona no encontrada'
            );
            this.personaEncontrada = null;
          }
        },
        error: (err) => {
          const msg = err.error?.mensaje ?? 'Error al consultar persona';
          this.notificacionService.showError(msg);
          this.personaEncontrada = null;
        },
      });
  }

  buscarFacturasCliente(idPersona: number): void {
    this.facturaService.consultarFacturaCliente(idPersona).subscribe({
      next: (res: any) => {
        if (res && res.respuesta) {
          this.facturasCliente = res.respuesta;
        } else {
          this.notificacionService.showError(
            res?.mensaje ?? 'No se encontraron facturas para el cliente'
          );
        }
      },
      error: (err) => {
        const msg =
          err.error?.mensaje ?? 'Error al consultar facturas del cliente';
        this.notificacionService.showError(msg);
      },
    });
  }

  buscarFacturaXml(): void {
    if (this.formularioBusquedaFactura.invalid) {
      this.formularioBusquedaFactura.markAllAsTouched();
      return;
    }
    const idFactura = this.formularioBusquedaFactura.get('idFactura')?.value;
    this.facturaService.consultarFacturaXml(idFactura).subscribe({
      next: (response) => {
        if (response && response.respuesta) {
          this.rawXml = response.respuesta;
          this.prettyXml = this.formatXml(this.rawXml);
          try {
            this.parsedXml = this.parseXmlToTree(this.rawXml);
          } catch (e) {
            this.parsedXml = [];
            console.warn('No se pudo parsear XML a árbol', e);
          }
          this.xmlGenerated = true;
          this.notificacionService.showExito('Factura XML encontrada.');
        } else {
          this.notificacionService.showError(
            response?.mensaje ?? 'Factura no encontrada'
          );
          this.xmlGenerated = false;
          this.rawXml = '';
          this.prettyXml = '';
        }
      },
      error: (err) => {
        console.error('Error al buscar la factura XML', err);
        this.notificacionService.showError('Error al buscar la factura XML');
      },
    });
  }

  generarFacturaXml(): void {
    if (!this.rawXml) return;
    this.prettyXml = this.formatXml(this.rawXml);
    this.xmlGenerated = true;
  }

  private formatXml(xml: string): string {
    if (!xml) return '';
    const PADDING = '  ';
    const reg = /(>)(<)(\/*)/g;
    let formatted = '';
    let pad = 0;
    xml = xml.replace(reg, '$1\n$2$3');
    const lines = xml.split('\n');
    for (let i = 0; i < lines.length; i++) {
      let line = lines[i].trim();
      if (line.match(/<\/\w/)) pad = Math.max(pad - 1, 0);
      formatted += PADDING.repeat(pad) + line + '\n';
      if (line.match(/<[^\/].*[^\/]>/) && !line.startsWith('<?')) pad++;
    }
    return formatted;
  }

  private parseXmlToTree(xml: string): any[] {
    const parser = new DOMParser();
    const doc = parser.parseFromString(xml, 'application/xml');
    const err = doc.getElementsByTagName('parsererror');
    if (err && err.length) throw new Error('XML inválido');

    const nodeToObj = (node: any) => {
      const obj: any = { name: node.nodeName, attributes: [], children: [], text: '' };
      if (node.attributes && node.attributes.length) {
        for (let i = 0; i < node.attributes.length; i++) {
          const a = node.attributes[i];
          obj.attributes.push({ name: a.name, value: a.value });
        }
      }
      for (let i = 0; i < node.childNodes.length; i++) {
        const c = node.childNodes[i];
        if (c.nodeType === 1) {
          obj.children.push(nodeToObj(c));
        } else if (c.nodeType === 3) {
          const t = (c.nodeValue || '').trim();
          if (t) obj.text += (obj.text ? ' ' : '') + t;
        }
      }
      return obj;
    };

    const roots: any[] = [];
    for (let i = 0; i < doc.childNodes.length; i++) {
      const n = doc.childNodes[i];
      if (n.nodeType === 1) roots.push(nodeToObj(n));
    }
    return roots;
  }
}
