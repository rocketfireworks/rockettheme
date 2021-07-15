import { SellyDiscountOnCartView } from "../theme/SellyDiscountOnCartView";
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

    this.sellyDiscountOnCartView = new SellyDiscountOnCartView();
    window.updateSellyDiscountOnCart = this.sellyDiscountOnCartView.update;

    window.updateSellyMotivationalMessage = this.sellyDiscountOnCartView.getMotivationalMessage;
    window.updateSellyCurrentDiscountMessage = this.sellyDiscountOnCartView.getCurrentDiscount;
    window.getFinalUnitPrice = this.sellyDiscountOnCartView.getFinalUnitPrice;
  }
}