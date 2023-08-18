import { Component, Input, OnInit } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { from } from 'rxjs';
import { Session } from '../helpers/session.dto';
@Component({
  selector: 'app-session-details',
  templateUrl: './session-details.component.html',
  styleUrls: ['./session-details.component.scss']
})
export class SessionDetailsComponent implements OnInit {
  sessionDetail: Session;
  @Input() sessionId;
  loading = true;
  constructor(private modalRef: BsModalRef) { }

  ngOnInit(): void {
    this.getSessionDetail();
  }


  getSessionDetail() {


  }

  closeModal() {
    this.modalRef.hide();
  }
}
