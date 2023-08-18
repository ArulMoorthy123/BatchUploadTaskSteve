import { Component, OnInit, Input, OnDestroy, Output, EventEmitter } from '@angular/core';
import { AppConstServ } from '../../../../shared/helper/app-constant.service';
import { QBService } from '../messenger/qb/services/qb.service';
import { QBDialogueService } from '../messenger/qb/services/qbDialogue.service';
import { Subscription } from 'rxjs';
import { getFullUrl, filterData } from '../../../../shared/helper/utilityHelper';

@Component({
  selector: 'app-connection-list',
  templateUrl: './connection-list.component.html',
  styleUrls: ['./connection-list.component.scss']
})
export class ConnectionListComponent implements OnInit, OnDestroy {

  @Input()
  public set searchText(searchText: string) {
      this.onFilter(searchText);
  }
  @Output() onSelectContactListEvent = new EventEmitter<string>();
  profileImg = AppConstServ.DEFAULT_PROFILE_URL;
  qbEventSubscription: Subscription;
  contactList: any = [];
  constructor(private qbService: QBService,
    private dialogueService: QBDialogueService, ) { }

  ngOnInit(): void {
    this.contactList = Object.values(this.qbService.contactList),
      this.qbEventSubscription = this.qbService.getObserverEvents()
        .subscribe((message: any) => {

        });
  }

  getProfileUrl(url) {
    if (!url) {
      return null;
    }
    else {
      return getFullUrl(url);
    }
  }

  onFilter(searchText) {
    console.log(searchText, 'search text in connection list')
    if(!searchText) {
      this.contactList=Object.values(this.qbService.contactList);
    }else {
      let filters: any = {
        firstName: firstName => firstName.toLowerCase().includes(searchText.toLowerCase()),
        lastName: lastName => lastName.toLowerCase().includes(searchText.toLowerCase()),
        email: email => email.toLowerCase().includes(searchText.toLowerCase())
      };
     this.contactList=filterData(filters,Object.values(this.qbService.contactList));
    }
  }

  showChat(contact) {
    //open message window for the contact
    if (contact.qbid) {
      let param = {
        'type': 3,
        'occupants_ids': contact.qbid
      };
      this.dialogueService.createDialog(param).then(res => {
        this.onSelectContactListEvent.emit(res._id);
      });
    }
  }


  ngOnDestroy(): void {
    this.qbEventSubscription.unsubscribe();
  }

}
