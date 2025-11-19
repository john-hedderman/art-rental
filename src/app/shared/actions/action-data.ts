import { HeaderButton, HeaderData, HeaderLink } from '../../model/models';

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
