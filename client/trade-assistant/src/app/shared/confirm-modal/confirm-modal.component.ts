import { Component, EventEmitter, Input, Output } from '@angular/core';
import { LanguageService } from '../../services/language/language.service';

@Component({
  selector: 'app-confirm-modal',
  standalone: true,
  templateUrl: './confirm-modal.component.html',
  styleUrls: ['./confirm-modal.component.scss']
})
export class ConfirmModalComponent {

  constructor(private languageService: LanguageService) {
    const lang = this.languageService.getLanguage();

    if (lang === 'DE') {
      this.message = 'Möchten Sie diesen Eintrag wirklich löschen?';
      this.confirmText = 'Ja';
      this.cancelText = 'Nein';
    }
  }

  @Input() message = 'Are you sure you want to delete this item?';
  @Input() confirmText = 'Yes';
  @Input() cancelText = 'No';

  @Output() confirm = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();

  onConfirm() {
    this.confirm.emit();
  }

  onCancel() {
    this.cancel.emit();
  }
}
