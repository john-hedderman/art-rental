import { HeaderData, HeaderButton, HeaderLink } from '../../model/models';

export class HeaderActions {
  data: HeaderData;

  constructor(pageId: string, title: string, buttons: HeaderButton[], links: HeaderLink[]) {
    this.data = {
      page: pageId,
      headerTitle: title,
      headerButtons: buttons,
      headerLinks: links,
    };
  }
}

export class ActionLink {
  data: HeaderLink;

  constructor(id: string, label: string, routerLink: string, linkClass: string, clickHandler: any) {
    this.data = {
      id,
      label,
      routerLink,
      linkClass,
      clickHandler,
    };
  }
}

export class ActionButton {
  constructor(
    public id: string,
    public label: string,
    public type: string,
    public buttonClass: string,
    public disabled: boolean,
    public dataBsToggle: string | null,
    public dataBsTarget: string | null,
    public clickHandler: any
  ) {}
}

export class FooterActions {
  constructor(public buttons: ActionButton[]) {
    this.buttons = buttons;
  }
}
