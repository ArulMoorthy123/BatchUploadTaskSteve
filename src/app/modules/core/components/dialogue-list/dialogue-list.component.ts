import { Component, OnInit, Output, EventEmitter, OnDestroy, Input } from '@angular/core';
import { QBDialogueService } from '../messenger/qb/services/qbDialogue.service';
import { QBService } from '../messenger/qb/services/qb.service';
import { Subscription } from 'rxjs';
import { filterData, getFullUrl } from '../../../../shared/helper/utilityHelper';
import { AppConstServ } from '../../../../shared/helper/app-constant.service';
import { QBCONSTAND } from '../../helpers/app.config';
import { QBHelperService } from '../messenger/qb/helpers/qbHelper.service';

@Component({
  selector: 'app-dialogue-list',
  templateUrl: './dialogue-list.component.html',
  styleUrls: ['./dialogue-list.component.scss']
})
export class DialogueListComponent implements OnInit, OnDestroy {

  @Output() onSelectDialogueListEvent = new EventEmitter<string>();

  @Input()
  public set dialogueId(dialogueId: string) {
    if (dialogueId) {
      this.showChat({ _id: dialogueId });
    }
  }
  @Input()
  public set searchText(searchText: string) {
    this.onFilter(searchText);
  }

  profileImg = AppConstServ.DEFAULT_PROFILE_URL;
  dialogueList = [];
  selectedDialogueId: string;
  qbEventSubscription: Subscription;
  loader :boolean =false;
  qbSession;
  constructor(private dialogueService: QBDialogueService,
    private qbhelper: QBHelperService,
    private qbService: QBService) { }

  ngOnInit(): void {
    this.getListDialogue(),
      this.qbEventSubscription = this.qbService
        .getObserverEvents()
        .subscribe((message: any) => {
          switch (message.type) {
            case 'dialogueListChange':
              this.dialogueList = message.data;
              break;
          }
          this.qbSession = this.qbService.getSession();
        });

  }

  getProfileUrl(dialogs) {
    return this.qbhelper.getDialogueImage(dialogs);
  }

  async getListDialogue() {
    this.loader=true;
    if (this.qbService.getQBStatus()) {
      if (!this.dialogueService.dialogs) {
        await this.dialogueService.getDialogs({}),
        this.loader=false;
      }
      this.dialogueList = Object.values(this.dialogueService.dialogs);
      this.loader=false;
      // if(this.dialogueList.length) {
      //   this.selectedDialogueId=this.dialogueList[0]._id;
      // }
    }
  }

  onFilter(searchText) {
    if (!searchText) {
      this.dialogueList = Object.values(this.dialogueService.dialogs);
    } else {
      let filters: any = {
        name: name => name.toLowerCase().includes(searchText.toLowerCase())
      };
      let result = filterData(filters, Object.values(this.dialogueService.dialogs));
      this.dialogueList = result;
    }
  }

  showChat(contact) {
    //open message window for the contact
    this.onSelectDialogueListEvent.emit(contact._id),
      this.selectedDialogueId = contact._id;
    console.log(`Message window for ${contact}`);
  }


  ngOnDestroy(): void {
    this.qbEventSubscription.unsubscribe();
  }
}
