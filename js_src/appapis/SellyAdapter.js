import { SellyDiscountOnCollectionView } from "../theme/SellyDiscountOnCollectionView";
import { Task } from "../utils/Task";


export class SellyAdapter extends Task {
  constructor () {
    super();
    this.name = 'SELLY ADAPTER';
  }

  start () {
    super.start();
    this.applyAdapter();
    this.done();
  }

  applyAdapter () {
    this.sellyDiscountOnCollectionView = new SellyDiscountOnCollectionView();
    window.updateDiscountOnCollectionPage = this.sellyDiscountOnCollectionView.update;
  }
}