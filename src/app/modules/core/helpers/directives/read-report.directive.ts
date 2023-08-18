import { Directive, HostBinding, Input, ElementRef } from '@angular/core';
import { isEmptyObj } from '../../mesibo/helpers/utilityHelper';
import { AuthService } from '../../../users/services/auth.service';
import { QBMessageService } from '../../components/messenger/qb/services/qbMessage.service';

@Directive({
  selector: '[readReport]'
})
export class ReadReportDirective {

  @Input('readReport') readReport: any;

  constructor(private el: ElementRef, private auth: AuthService,
    private qbMessage: QBMessageService) { }

  ngAfterViewInit() {
    this.canLazyLoad() ? this.lazyLoad() : this.sendReadReport();
  }

  private canLazyLoad() {
    return window && 'IntersectionObserver' in window;
  }

  private lazyLoad() {
    const obs = new IntersectionObserver(entries => {
      entries.forEach(({ isIntersecting }) => {
        if (isIntersecting) {
          this.sendReadReport();
          obs.unobserve(this.el.nativeElement);
        }
      });
    });
    obs.observe(this.el.nativeElement);
  }

  private sendReadReport() {
    if (!isEmptyObj(this.readReport)) {
      if (this.auth.currentUserValue.qbid != this.readReport.sender_id) {
        let messageId = this.readReport._id;
        let dialogue_id = this.readReport.chat_dialog_id
        let delivery = this.readReport.delivered_ids.filter(a => a == this.auth.currentUserValue.qbid)
        if (delivery.length == 0) {
          this.qbMessage.sendDeliveryStatus(messageId, dialogue_id, this.auth.currentUserValue.qbid);
        }
        let read = this.readReport.read_ids.filter(a => a == this.auth.currentUserValue.qbid)
        if (read.length == 0) {
          this.qbMessage.sendReadStatus(messageId, dialogue_id, this.auth.currentUserValue.qbid);
        }

      }

    }

  }


}
