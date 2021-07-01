// define templates for the ShowTime theme
var usfAssetUrl;
var usfFilesUrl;
window._usfTemplates = {};
var _usfVariations = `
<div class="variations">
    <template v-if="product.options.length > 1">
        <div v-for="(o,index) in product.options" class="selector-wrapper recommended-product-select">
            <label :class="{'hidden': o.name == 'default'}" :for="'product-select-' + o.name" v-html="o.name"></label>
            <select :class="'single-option-selector SingleOptionSelector-' + index">
                <option v-for="optVal in o.values" :data-value="optVal" :selected="selectedVariantForPrice.options[index] != undefined && o.values[selectedVariantForPrice.options[index]] == optVal" v-html="optVal"></option>
            </select>
        </div>
    </template>
    <!--end variations-->
    <!--selector-->
    <select name="id" :id="'product-select-' + product.id" class="product-variants form-control hidden">
        <template v-for="v in product.variants">
            <option v-if="usf.utils.isVariantSoldOut(v)" :data-inventory_management="_usfSectionSettings.show_product_quantity ? 'shopify' : false" :data-inventory_policy="_usfSectionSettings.show_product_quantity && v.flags == 1 ? 'continue' : false" :data-inventory_quantity="_usfSectionSettings.show_product_quantity ? String(v.available) : false" disabled="disabled" :value="v.id" v-html="getVariantOption(v.options,product,true) + ' - ' + loc.soldOut">
            </option>
            <option v-esle :data-inventory_management="_usfSectionSettings.show_product_quantity ? 'shopify' : false" :data-inventory_policy="_usfSectionSettings.show_product_quantity && v.flags == 1 ? 'continue' : false" :data-inventory_quantity="_usfSectionSettings.show_product_quantity ? String(v.available) : false" :selected="v.id === selectedVariantForPrice.id" :data-sku="v.sku" :data-options="getVariantOption(v.options,product,false)" :value="v.id" v-html="getVariantOption(v.options,product,true) + ' - ' + usf.utils.getDisplayPrice(v.price)"></option>

        </template>
    </select>
    <!--end selector-->
    <!--swatchs-->
    <usf-swatches :value="product"></usf-swatches>
</div>`;
var _usfProductPriceTemplate = `
<div class="price card-price" :class="{'on-sale': hasDiscount}">
    <div v-if="hasDiscount" class="money compare-price" v-html="displayPrice"></div>
    <span v-if="price == 0 && _usfGlobalSettings.custom_price0_text != ''" v-html="_usfGlobalSettings.custom_price0_text"></span>
    <template v-else>
        <template v-if="priceVaries && !product.selectedVariantId">
            {{ loc.from }}
        </template>
        <span class="money" :class="{'sale-price': hasDiscount}" v-html="displayDiscountedPrice"></span>
    </template>
</div>
`;
var _usfFilterBodyTemplate = /*inc_begin_filter-body*/
    `<!-- Range filter -->
<div v-if="isRange" class="usf-facet-values usf-facet-range">
    <!-- Range inputs -->
    <div class="usf-slider-inputs usf-clear" :class="facet.title">
        <span class="usf-slider-input__from">
            <span class="usf-slider-input__prefix" v-html="facet.sliderPrefix" v-if="facet.showSliderInputPrefixSuffix"></span>
            <input :readonly="!hasRangeInputs" :value="rangeConverter(range[0]).toFixed(rangeDecimals)" @change="e => onRangeInput(e, range[0], 0)">
            <span class="usf-slider-input__suffix" v-html="facet.sliderSuffix" v-if="facet.showSliderInputPrefixSuffix"></span>
        </span>
        <span class="usf-slider-div">-</span>
        <span class="usf-slider-input__to">
            <span class="usf-slider-input__prefix" v-html="facet.sliderPrefix" v-if="facet.showSliderInputPrefixSuffix"></span>
            <input :readonly="!hasRangeInputs" :value="rangeConverter(range[1]).toFixed(rangeDecimals)" @change="e => onRangeInput(e, range[1], 1)">
            <span class="usf-slider-input__suffix" v-html="facet.sliderSuffix" v-if="facet.showSliderInputPrefixSuffix"></span>
        </span>
    </div>
	<!-- See API reference of this component at https://docs.sobooster.com/search/storefront-js-api/slider-component -->
    <usf-slider :color="facet.sliderColor" :symbols="facet.sliderValueSymbols" :prefix="facet.sliderPrefix" :suffix="facet.sliderSuffix" :min="facet.min" :max="facet.max" :pips="facet.range[0]" :step="facet.range[1]" :decimals="rangeDecimals" :value="range" :converter="rangeConverter" @input="onRangeSliderInput" @change="onRangeSliderChange"></usf-slider>
</div>
<!-- List + Swatch filter -->
<div v-else ref="values" :class="'usf-facet-values usf-facet-values--' + facet.display + (facet.navigationCollections ? ' usf-navigation' : '') + (facet.valuesTransformation ? (' usf-' + facet.valuesTransformation.toLowerCase()) : '') + (facet.circleSwatch ? ' usf-facet-values--circle' : '')" :style="!usf.isMobile && facet.maxHeight ? { maxHeight: facet.maxHeight } : null">
    <!-- Filter options -->                
    <usf-filter-option v-for="o in visibleOptions" :facet="facet" :option="o" :key="o.label"></usf-filter-option>
</div>

<!-- More -->
<div v-if="isMoreVisible" class="usf-more" @click="onShowMore" v-html="loc.more"></div>`
/*inc_end_filter-body*/;

var _usfSearchResultsSkeletonItemTpl = `
<div v-if="view === 'grid'" class="usf-sr-product col-sm-6 col-xs-6 element mb30 usf-skeleton" :class="['col-md-' + _usf_grid_item_width]">
    <div class="grid-view-item" v-if="true">
        <div class="usf-img"></div>
        <div class="usf-meta">            
        </div>
    </div>
</div>
<a class="usf-sr-product list-view-item usf-skeleton" v-else>
    <!-- Image column -->
    <div class="list-view-item__image-column" v-if="true">
        <div class="list-view-item__image-wrapper" v-if="true">
            <div class="usf-img"></div>
        </div>
    </div>

    <!-- Title and Vendor column -->
    <div class="list-view-item__title-column" v-if="true">
        <div class="list-view-item__title"></div>
        <div class="list-view-item__vendor medium-up--hide"></div>
    </div>

    <!-- Vendor, for mobile -->
    <div class="list-view-item__vendor-column small--hide" v-if="true">
        <div class="list-view-item__vendor"></div>
    </div>

    <!-- Prices -->
    <div class="list-view-item__price-column" v-if="true">
        <div class="usf-price product-price__price"></div>
    </div>
</a>
`;

var _usfSearchResultsSummaryTpl = /*inc_begin_search-summary*/
    `<span class="usf-sr-summary" v-html="loader === true ? '&nbsp;' : usf.utils.format(term ? loc.productSearchResultWithTermSummary : loc.productSearchResultSummary, result.total, term)"></span>`
/*inc_end_search-summary*/;

var _usfSearchResultsViewsTpl = /*inc_begin_search-views*/
    `<div class="usf-views">
    <button class="usf-view usf-grid usf-btn" :class="{'usf-active': view === 'grid'}" @click="onGridViewClick"><svg role="presentation" viewBox="0 0 36 36"><path fill="currentColor" d="M8 0L0 0L0 8L8 8L8 0ZM14 0L22 0L22 8L14 8L14 0ZM36 0L28 0L28 8L36 8L36 0ZM0 14L8 14L8 22L0 22L0 14ZM22 14L14 14L14 22L22 22L22 14ZM28 14L36 14L36 22L28 22L28 14ZM8 28L0 28L0 36L8 36L8 28ZM14 28L22 28L22 36L14 36L14 28ZM28 36L28 28L36 28L36 36L28 36Z"/></svg></button>
    <button class="usf-view usf-list usf-btn" :class="{'usf-active': view === 'list'}" @click="onListViewClick"><svg role="presentation" viewBox="0 0 18 18"><path d="M8 1.030067h9c.5522847 0 1 .44771525 1 1s-.4477153 1-1 1H8c-.55228475 0-1-.44771525-1-1s.44771525-1 1-1zm0 7h9c.5522847 0 1 .44771525 1 1s-.4477153 1-1 1H8c-.55228475 0-1-.44771525-1-1s.44771525-1 1-1zm0 7h9c.5522847 0 1 .4477153 1 1s-.4477153 1-1 1H8c-.55228475 0-1-.4477153-1-1s.44771525-1 1-1zm-7-15h2c.55228475 0 1 .44771525 1 1v2c0 .55228475-.44771525 1-1 1H1c-.55228475 0-1-.44771525-1-1v-2c0-.55228475.44771525-1 1-1zm0 7h2c.55228475 0 1 .44771525 1 1v2c0 .5522847-.44771525 1-1 1H1c-.55228475 0-1-.4477153-1-1v-2c0-.55228475.44771525-1 1-1zm0 7h2c.55228475 0 1 .4477153 1 1v2c0 .5522847-.44771525 1-1 1H1c-.55228475 0-1-.4477153-1-1v-2c0-.5522847.44771525-1 1-1z" fill="currentColor"></path></svg></button>
</div>`
/*inc_end_search-views*/;

var _usfSearchResultsSortByTpl = /*inc_begin_search-sortby*/
    `<usf-dropdown :value="sortBy" :options="sortByOptions" @input="onSortByChanged"></usf-dropdown>`
/*inc_end_search-sortby*/;

usf.templates = {
    // application
    app: /*inc_begin_app*/
        `<div id="usf_container" class="usf-zone usf-clear" :class="{'usf-filters-horz': usf.settings.filters.horz}">
    <usf-filters></usf-filters>
    <usf-sr></usf-sr>
</div>`
/*inc_end_app*/,
    searchResults: `
<div class="usf-sr-container" :class="{'usf-no-facets': noFacets, 'usf-empty': !loader && !hasResults, 'usf-nosearch': !showSearchBox}">
    <!-- Search form -->
    <form v-if="showSearchBox" action="/search" method="get" role="search" class="usf-sr-inputbox">
        <input name="q" autocomplete="off" ref="searchInput" v-model="termModel">
        <button type="submit">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 25 25"><circle class="usf-path" cx="10.981" cy="10.982" r="9.786"></circle> <line class="usf-path" x1="23.804" y1="23.804" x2="17.902" y2="17.901"></line></svg>
        </button>
        <span v-if="termModel" class="usf-remove" @click="clearSearch"></span>
    </form>

    <usf-sr-banner v-if="result && result.extra && result.extra.banner && !result.extra.banner.isBottom" :banner="result.extra.banner"></usf-sr-banner>
    <div v-if="window._usf_featured_product" v-html="_usf_featured_product"></div>
    
    <div class="usf-sr-config" v-if="usf.isMobile">
        <div class="usf-sr-config__mobile-filters-wrapper">
            ` + _usfSearchResultsSortByTpl + `
            <div class="usf-filters" :class="{'usf-has-filters': !!facetFilters}" @click="document.body.classList.toggle('usf-mobile-filters')">
                <span class="usf-icon"><svg width="17" height="16" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 17 16"><g fill="currentColor" fill-rule="evenodd"><rect x="2" width="1" height="5" rx=".5"></rect><rect x="8" width="1" height="9" rx=".5"></rect><rect x="14" width="1" height="3" rx=".5"></rect><rect x="2" y="8" width="1" height="8" rx=".5"></rect><rect x="8" y="12" width="1" height="4" rx=".5"></rect><rect x="14" y="6" width="1" height="10" rx=".5"></rect><path d="M2.5 8.5a2 2 0 1 1 0-4 2 2 0 0 1 0 4zm0-1a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm6 5a2 2 0 1 1 0-4 2 2 0 0 1 0 4zm0-1a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm6-5a2 2 0 1 1 0-4 2 2 0 0 1 0 4zm0-1a1 1 0 1 0 0-2 1 1 0 0 0 0 2z" fill-rule="nonzero"></path></g></svg></span>
                <span v-html="loc.filters"></span>
            </div>
        </div>
        
        ` + _usfSearchResultsSummaryTpl + _usfSearchResultsViewsTpl + `
    </div>
    
    <div class="usf-sr-config" v-if="!usf.isMobile">
        ` + _usfSearchResultsSummaryTpl + _usfSearchResultsSortByTpl + _usfSearchResultsViewsTpl + `
    </div>
    <div :class="(view === \'grid\' ? \'collection-grid\' : \'collection-list element\') + \' usf-results usf-\' + view">
        <template v-if="loader===true">` + _usfSearchResultsSkeletonItemTpl + _usfSearchResultsSkeletonItemTpl + _usfSearchResultsSkeletonItemTpl + _usfSearchResultsSkeletonItemTpl +
        `</template>
        <template v-else>
            <template v-if="loader === true || hasResults">
                <template v-if="view === 'grid'">
                    <template v-for="p in result.items"><usf-sr-griditem :product="p" :result="result"></usf-sr-griditem></template>
                </template>
                <template v-else>
                    <template v-for="p in result.items"><usf-sr-listitem :product="p" :result="result"></usf-sr-listitem></template>
                </template>
            </template>
            <template v-else>
                <!-- Empty result -->
                <div class="usf-sr-empty">
                    <div class="usf-icon"></div>
                    <span v-html="term ? usf.utils.format(loc.productSearchNoResults, term) : loc.productSearchNoResultsEmptyTerm"></span>
                </div>
            </template>
        </template>
    </div>

    <usf-sr-banner v-if="result && result.extra && result.extra.banner && result.extra.banner.isBottom" :banner="result.extra.banner"></usf-sr-banner>

    <!-- Paging & load more -->
    <div class="usf-sr-paging" v-if="loader !== true">
        <div class="usf-sr-loader" v-if="loader === 'more'">
            <div class="usf-spinner"></div>
        </div>

        <div class="usf-sr-more" v-else-if="hasResults && usf.settings.search.more === 'more'">
            <div class="usf-title" v-html="usf.utils.format(loc.youHaveViewed, itemsLoaded, result.total)"></div>
            <div class="usf-progress">
                <div :style="{width: (itemsLoaded * 100 / result.total) + '%'}"></div>
            </div>
            <div v-if="itemsLoaded < result.total" class="usf-load-more" @click="onLoadMore" v-html="loc.loadMore"></div>
        </div>
        <usf-sr-pages v-else-if="hasResults && usf.settings.search.more === 'page'" :page="page" :pages-total="pagesTotal" :pages-to-display="4" :side-pages-to-display="1"></usf-sr-pages>
    </div>
</div>
`,
    searchResultsGridViewItem: `
<div class="col-sm-6 col-xs-6 element mb30" :class="['col-md-' + _usf_grid_item_width]" :key="product.id" :product-selector="product.id">
    <div class="main_box" :class="{'quick-view-overlay':_usfSectionSettings.collection_overlay}" >
        <form method="post" action="/cart/add" class="add-to-cart-form">
            
            <div>
                <div class="box_1">
                    `+ _usfProductPriceTemplate + `
                    <div v-if="product.tags.includes('bulk_deals')" class="bulkDeals"><i class="fa fa-dollar-sign"></i> Bulk Deals</div>
                    <div v-if="product.tags.includes('staff_pick')" class="staffPick"><i class="fa fa-star"></i> Staff Pick</div>
                    <!--variations-->
                    `+ _usfVariations +`
                    <div class="product-image-container fakea">
                        <div :data-usf-template="product.urlName"></div>

                        <a :href="productUrl" @click="onItemClick" @mouseover="onItemHover" @mouseleave="onItemLeave" class="product-image-link">
                            <img class="lazyload" :src="selectedImageUrl" :data-srcset="selectedImageUrl + ' 1x, ' + _usfGetOriginImgWithSize(selectedImage.url, usf.settings.search.imageSize + 'x@2x') + ' 2x, ' + _usfGetOriginImgWithSize(selectedImage.url, usf.settings.search.imageSize + 'x@3x') + ' 3x'" :alt="selectedImage.alt" :style="_getImageMaxWidth(selectedImage)" />

                            <div class="spinner-cube">
                                <div class="loadFacebookG"></div>
                            </div>
                            <!-- Labels -->
                            <usf-plugin name="searchResultsProductLabel" :data="pluginData"></usf-plugin>
                            <!-- Wishlist -->
                            <usf-plugin name="searchResultsProductWishList" :data="pluginData"></usf-plugin>
                        </a>
                        <div v-if="_usfSectionSettings.collection_overlay" class="overlay">
                            <a class="absolute-pos popup-text quick-view-btn btn_c cart_btn_1" :href="productUrl.split('?').shift()" data-effect="mfp-move-from-top" data-toggle="tooltip" data-placement="top" :title="loc.quickView" v-html="loc.quickView"></a>
                            <a class="overlay-second-link" :href="productUrl.split('?').shift()"></a>
                        </div>
                    </div>
                </div>
                <div class="desc">
                    <!--title-->
                    <h5><a :href="productUrl" v-html="product.title"></a><span class="product-data" :data-product-id="product.id" :data-product-url="product.urlName" :data-product-price="price*100"></span>
                    </h5>
                    <p v-if="_usfSectionSettings.show_grid_type" v-html="product.productType"></p>
                    <!--Video-->
                    <span v-if="product.tags.includes('video_available')" class="productVideoIcon">
                        <a class="popup-youtube" :href="usf.utils.getMetafield(product,'custom_fields','youtube_embed_code')">
                            <img :src="_usfVideoIcon"> View Video</a>
                    </span>
                    <!-- Product review -->
                    <template v-if="_usfSectionSettings.show_product_reviews_stars">
                        <usf-plugin name="searchResultsProductReview" :data="pluginData"></usf-plugin>
                        <div class="clearfix"></div>
                    </template>
                </div>
            </div>
            <!--add to cart-->
            <div class="proListAddToCart">
                <input name="add" :value="loc.addToCart" type="submit" class="proListAddToCartBtn" />
            </div>
        </form>
    </div>
</div>
`,

    // Search result pages
    searchResultsPages: `
<div class="page_c clearfix red5">
    <template v-for="e in elements">
        <a v-if="e.type === 'prev'" class="prev" href="javascript:void(0)" :title="loc.prevPage" @click="onPrev" style="font-size:14px"><span class="fa fa-chevron-left"></span></a>

        <span v-else-if="e.type === 'dots'" class="deco" style="padding:0 7px">…</span>
        <span v-else-if="e.type === 'page' && e.current" class="page current" style="padding:0 7px">{{e.page}}</span>
        <span v-else-if="e.type === 'page' && !e.current" class="page" style="padding:0 7px"><a href="javascript:void(0)" @click="ev=>onPage(e.page,ev)" :title="usf.utils.format(loc.gotoPage,e.page)">{{e.page}}</a></span>
        <span v-else-if="e.type === 'next'" class="next" style="padding:0 7px">
            <a href="javascript:void(0)" :title="loc.nextPage" @click="onNext" style="font-size:14px">→</a>
        </span>

        <a v-else-if="e.type === 'next'" class="next" href="javascript:void(0)" :title="loc.nextPage" @click="onNext" style="font-size:14px"><span class="fa fa-chevron-right"></span></a>
    </template>
</div>
`,

    searchResultsListViewItem: `
<form method="post" action="/cart/add" class="add-to-cart-form product-container" @click="onItemClick" @mouseover="onItemHover" @mouseleave="onItemLeave" :key="product.id" :product-selector="product.id">
    <input type="hidden" name="id" :value="selectedVariantForPrice.id" />
    <div class="product-gallery-container fakea" :href="productUrl">
        <div :data-usf-template="product.urlName"></div>
        <div class="product-data hide-large" :data-product-id="product.id" :data-product-url="product.urlName" :data-product-price="price*100"></div>
        <div class="spinner-cube">
            <div class="loadFacebookG"></div>
        </div>
        <a :href="productUrl" class="product-image-link">
            <img class="lazyload" :src="selectedImageUrl" :data-srcset="selectedImageUrl + ' 1x, ' + _usfGetOriginImgWithSize(selectedImage.url, usf.settings.search.imageSize + 'x@2x') + ' 2x, ' + _usfGetOriginImgWithSize(selectedImage.url, usf.settings.search.imageSize + 'x@3x') + ' 3x'" :alt="selectedImage.alt" :style="_getImageMaxWidth(selectedImage)" />
            <!-- Labels -->
            <usf-plugin name="searchResultsProductLabel" :data="pluginData"></usf-plugin>
            <!-- Wishlist -->
            <usf-plugin name="searchResultsProductWishList" :data="pluginData"></usf-plugin>
        </a>
    </div>

    <div class="product-details">
        <div class="product-title-inventory">
            <h3><a :href="productUrl" v-html="product.title"></a></h3>
            <div class="prod_sku_container">
                <div v-if="_usfSectionSettings.show_product_quantity" class="prod_sku_vend">
                    <div id="variant-inventory">
                    </div>
                </div>
            </div>
        </div>

        <div class="product-price-qty">
            <div class="price" :class="{'smart_checkout_price_pos': _usfSectionSettings.show_smart_checkout}">
                <div v-if="hasDiscount" class="compare-price" v-html="displayPrice"></div>
                <span v-if="price == 0 && _usfGlobalSettings.custom_price0_text != ''" v-html="_usfGlobalSettings.custom_price0_text"></span>
                <template v-else>
                    <template v-if="priceVaries && !product.selectedVariantId">
                        {{ loc.from }}
                    </template>
                    <span class="product-price" :class="{'sale-price': hasDiscount}" v-html="displayDiscountedPrice"></span>
                </template>
                <div class="product-data" :data-product-id="product.id" :data-product-url="product.urlName" :data-product-price="price*100"></div>
            </div>
            <div class="qty product-page-qty">
                <template v-if="!_usfGlobalSettings.hide_price0_box_and_button && price > 0">
                    <span class="productPGQtyLable">Quantity</span><a class="minus_btn"></a>
                    <input type="text" name="quantity" class="txtbox" value="1" min="1">
                    <a class="plus_btn"></a>
                </template>
                <div class="maximum-in-stock-error error-popup" v-html="_usf_qty_error"></div>
            </div>
        </div>
    </div>
    <usf-plugin name="searchResultsProductReview" :data="pluginData"></usf-plugin>
    <div class="product-description">
        <!-- Product's metafield data -->
        <div v-if="(_effect = usf.utils.getMetafield(product,'details','effect')) != ''"><span class="data-title">Effect:</span> {{ _effect }}</div>
        <div v-if="(_duration = usf.utils.getMetafield(product,'details','duration')) != ''"><span class="data-title">Duration:</span> {{ _duration }}</div>
        <div v-if="(_height = usf.utils.getMetafield(product,'details','height')) != ''"><span class="data-title">Height:</span> {{ _height }}</div>
        <p v-if="product.description" class="product-desc" v-html="_usfTruncateWords(product.description,25)"></p>
        <div>
            <div v-if="product.tags.includes('bulk_deals')" class="bulkDeals"><i class="fa fa-dollar-sign"></i> Bulk Deals</div>
            <div v-if="product.tags.includes('staff_pick')" class="staffPick"><i class="fa fa-star"></i> Staff Pick</div>

            <!--variations-->
            `+ _usfVariations +`
        </div>
        <div class="proListAddToCart">
            <input name="add" :value="loc.addToCart" type="submit" class="proListAddToCartBtn" />
        </div>
    </div>
</form>
`,
    // AddToCart Plugin	
    addToCartPlugin: `
<form class="usf-add-to-cart" method="POST" enctype="multipart/form-data" :action="usf.platform.addToCartUrl">
    <input type="hidden" name="id" :value="variant.id">
    <button :class="{'usf-visible': args.isHover}" type="submit" name="add" class="usf-add-to-cart-btn  usf-ajax-to-cart" :data-product-id="args.product.id"  @click="e => usf.__addCartAjax(e.target)" :style="{borderColor:settings.buttonBorderColor,color:settings.buttonTextColor,backgroundColor:settings.buttonBackgroundColor}">
        <span class="usf-text" v-html="loc.addToCart"></span>
        <svg x="0px" y="0px" width="32px" height="32px" viewBox="0 0 32 32" class="checkmark">
            <path fill="none" stroke-width="2" stroke-linecap="square" stroke-miterlimit="10" d="M9,17l3.9,3.9c0.1,0.1,0.2,0.1,0.3,0L23,11"/>
        </svg>
    </button>
</form>
`,
    // Preview Plugin
    previewPlugin: `

`,
    previewPluginModal:
        ``,
    gotoTop: /*inc_begin_goto-top*/
        `<div class="usf-goto-top">
    <div class="usf-icon usf-icon-up"></div>
</div>`
/*inc_end_goto-top*/,
    searchResultsBanner: /*inc_begin_search-banner*/
        `<div class="usf-sr-banner">
    <a :href="banner.url || 'javascript:void(0)'" :alt="banner.description">
        <img :src="banner.mediaUrl" style="max-width:100%">
    </a>
</div>
`
/*inc_end_search-banner*/,

    ////////////////////////
    // Filter templates
    // facet filters breadcrumb
    filtersBreadcrumb: /*inc_begin_filters-breadcrumb*/
        `<div v-if="usf.settings.filterNavigation.showFilterArea && root.facetFilters && root.facets && facetFilterIds.length" class="usf-refineby">
    <!-- Breadcrumb Header -->
    <div class="usf-title usf-clear">
        <span class="usf-pull-left usf-icon usf-icon-equalizer"></span>
        <span class="usf-label" v-html="loc.filters"></span>

        <!-- Clear all -->
        <button class="usf-clear-all usf-btn" v-html="loc.clearAll" @click="root.removeAllFacetFilters" :aria-label="loc.clearAllFilters"></button>
    </div>

    <!-- Breadcrumb Values -->
    <div class="usf-refineby__body">
        <template v-for="facetId in facetFilterIds" v-if="(facet = root.facets.find(fc => fc.id === facetId)) && (f = root.facetFilters[facetId])">
            <template v-for="queryValStr in f[1]">
                <div class="usf-refineby__item usf-pointer usf-clear" @click="root.removeFacetFilter(facetId, queryValStr)">
                    <button class="usf-btn"><span class="usf-filter-label" v-html="facet.title + ': '"></span><b v-html="root.formatBreadcrumbLabel(facet, f[0], queryValStr)"></b></button><span class="usf-remove"></span>
                </div>
            </template>
        </template>
    </div>
 </div>`
 /*inc_end_filters-breadcrumb*/,

    // facet filters    
    filters: /*inc_begin_filters*/
        // Vert & Horz modes have different render order
        `<div class="usf-facets usf-no-select usf-zone">
<!-- Mobile view -->
<template v-if="usf.isMobile">
    <div class="usf-close" @click="onMobileBack(1)"></div>
    <div class="usf-facets-wrapper">
        <!-- Header. shows 'Filters', facet name, etc. -->
        <div class="usf-header">
            <!-- Single facet mode -->
            <template v-if="isSingleFacetMode">
                <div class="usf-title" @click="onMobileBack(0)" v-html="facets[0].title"></div>
                <div v-if="facetFilters" class="usf-clear" @click="removeAllFacetFilters" v-html="loc.clear"></div>
            </template>

            <!-- When a filter is selected -->
            <template v-else-if="mobileSelectedFacet">
                <div class="usf-title usf-back" @click="onMobileBack(0)" v-html="mobileSelectedFacet.title"></div>
                <div v-if="facetFilters && facetFilters[mobileSelectedFacet.id]" class="usf-clear" @click="removeFacetFilter(mobileSelectedFacet.id)" v-html="loc.clear"></div>
                <div v-else class="usf-all" v-html="loc.all"></div>
            </template>

            <!-- When no filter is selected -->
            <template v-else>
                <div class="usf-title" @click="onMobileBack(0)" v-html="loc.filters"></div>
                <div v-if="facetFilters" class="usf-clear" @click="removeAllFacetFilters" v-html="loc.clearAll"></div>
            </template>
        </div>

        <div class="usf-body">
            <!-- List all filter options, in single facet mode -->
            <usf-filter v-if="isSingleFacetMode" :facet="facets[0]"></usf-filter>

            <!-- List all filter options, when a filter is selected -->
            <usf-filter v-else-if="mobileSelectedFacet" :facet="mobileSelectedFacet"></usf-filter>

            <!-- List all when there are more than one facet -->
            <template v-else :key="f.id" v-for="f in facets">
                <template v-if="canShowFilter(f)">
                    <div class="usf-facet-value" @click="onMobileSelectFacet(f)">
                        <span class="usf-title" v-html="f.title"></span>
                        <div v-if="(selectedFilterOptionValues = facetFilters && (ff = facetFilters[f.id]) ? ff[1] : null)" class="usf-dimmed">
                            <span v-for="cf in selectedFilterOptionValues" v-html="formatBreadcrumbLabel(f, f.facetName, cf)"></span>
                        </div>
                    </div>
                </template>
            </template>
        </div>

        <!-- View items -->
        <div class="usf-footer">
            <div @click="onMobileBack(1)" v-html="loc.viewItems"></div>
        </div>
    </div>
</template>

<!-- Desktop view -->
<template v-else>
    <usf-filter-breadcrumb></usf-filter-breadcrumb>    
    <!-- Filters Loader -->
    <div v-if="!facets" class="usf-facets__first-loader">
        <template v-for="i in 3">
            <div class="usf-facet"><div class="usf-title usf-no-select"><span class="usf-label"></span></div>
                <div v-if="!usf.settings.filters.horz" class="usf-container"><div class="usf-facet-values usf-facet-values--List"><div class="usf-relative usf-facet-value usf-facet-value-single"><span class="usf-label"></span><span class="usf-value"></span></div><div class="usf-relative usf-facet-value usf-facet-value-single"><span class="usf-label"></span><span class="usf-value"></span></div></div></div>
            </div>
        </template>
    </div>
    <!-- Facets body -->
    <div v-else class="usf-facets__body">
        <usf-filter :facet="f" :key="f.id" v-for="f in facets"></usf-filter>
    </div>
</template>
</div>`
/*inc_end_filters*/,

    // facet filter item
    filter: /*inc_begin_filter*/
        `<div v-if="canShow" class="usf-facet" :class="{'usf-collapsed': collapsed && !usf.isMobile, 'usf-has-filter': isInBreadcrumb}">
    <!-- Mobile filter -->
    <div v-if="usf.isMobile" class="usf-container">
        <!-- Search box -->
        <input v-if="hasSearchBox" class="usf-search-box" :aria-label="loc.filterOptions" :placeholder="loc.filterOptions" :value="term" @input="v => term = v.target.value">

        <!-- Values -->
        ` + _usfFilterBodyTemplate +
        `</div>

    <!-- Desktop filter -->
    <template v-else>
        <!-- Filter title -->
        <div class="usf-clear">
            <div class="usf-title usf-no-select" @click="onExpandCollapse">
                <button class="usf-label usf-btn" v-html="facet.title" :aria-label="usf.utils.format(loc.filterBy,facet.title)" :aria-expanded="!collapsed"></button>
                <usf-helptip v-if="facet.tooltip" :tooltip="facet.tooltip"></usf-helptip>            
                <!-- 'Clear all' button to clear the current facet filter. -->
                <button v-if="isInBreadcrumb" class="usf-clear-all usf-btn" :title="loc.clearFilterOptions" :aria-label="usf.utils.format(loc.clearFiltersBy,facet.title)" @click="onClear" v-html="loc.clear"></button>
            </div>
        </div>

        <!-- Filter body -->
        <div class="usf-container">
            <!-- Search box -->
            <input v-if="hasSearchBox" class="usf-search-box" :placeholder="loc.filterOptions" :value="term" @input="v => term = v.target.value">

            ` + _usfFilterBodyTemplate +
        `
        </div>
    </template>
</div>`
/*inc_end_filter*/,

    // facet filter option
    filterOption: /*inc_begin_filter-option*/
        `<div v-if="children" :class="(isSelected ? 'usf-selected ' : '') + ' usf-relative usf-facet-value usf-facet-value-single usf-with-children' + (collapsed ? ' usf-collapsed' : '')">
    <!-- option label -->
    <button class="usf-children-toggle usf-btn" v-if="children" @click="onToggleChildren"></button>
    <button class="usf-label usf-btn" v-html="label" @click="onToggle"></button>

    <!-- product count -->
    <span v-if="!(!usf.settings.filterNavigation.showProductCount || (swatchImage && !usf.isMobile)) && option.value !== undefined" class="usf-value">{{option.value}}</span>    

    <div class="usf-children-container" v-if="children && !collapsed">
        <button :class="'usf-child-item usf-btn usf-facet-value' + (isChildSelected(c) ? ' usf-selected' : '')" v-for="c in children" v-html="getChildLabel(c)" @click="onChildClick(c)"></span>
    </div>
</div>
<div v-else :class="(isSelected ? 'usf-selected ' : '') + (swatchImage ? ' usf-facet-value--with-background' : '') + (' usf-relative usf-facet-value usf-facet-value-' + (facet.multiple ? 'multiple' : 'single'))" :title="isSwatch || isBox ? option.label + ' (' + option.value + ')' : undefined" :style="usf.isMobile ? null : swatchStyle" @click="onToggle">
    <!-- checkbox -->
    <div v-if="!isBox && !isSwatch && facet.multiple" :class="'usf-checkbox' + (isSelected ? ' usf-checked' : '')">
        <span class="usf-checkbox-inner"></span>
    </div>

    <!-- swatch image in mobile -->
    <div v-if="swatchImage && usf.isMobile" class="usf-mobile-swatch" :style="swatchStyle"></div>

    <!-- option label -->
    <button class="usf-label usf-btn" v-html="label"></button>

    <!-- helper for swatch -->
    <button v-if="isSwatch" class="usf-btn-helper usf-btn" :aria-checked="isSelected" role="checkbox"></button>
    
    <!-- product count -->
    <span v-if="!(!usf.settings.filterNavigation.showProductCount || (swatchImage && !usf.isMobile)) && option.value !== undefined" class="usf-value">{{option.value}}</span>
</div>`
/*inc_end_filter-option*/,



    // Instant search popup
    instantSearch: /*inc_begin_instantsearch*/
        `<div :class="'usf-popup usf-zone usf-is usf-is--' + position + (shouldShow ? '' : ' usf-hidden') + (isEmpty ? ' usf-empty' : '') + (firstLoader ? ' usf-is--first-loader': '')"  :style="usf.isMobile ? null : {left: this.left + 'px',top: this.top + 'px',width: this.width + 'px'}">
    <!-- Mobile search box -->
    <div v-if="usf.isMobile">
        <form class="usf-is__inputbox" :action="searchUrl" method="get" role="search">
            <span class="usf-icon usf-icon-back usf-close" @click="close"></span>
            <input name="q" autocomplete="off" ref="searchInput" :value="term" @input="onSearchBoxInput">
            <span class="usf-remove" v-if="term" @click="onClear"></span>
        </form>
    </div>

    <!-- First loader -->
    <div class="usf-is__first-loader" v-if="firstLoader">
        <div class="usf-clear">
            <div class="usf-img"></div>
            <div class="usf-title"></div>
            <div class="usf-subtitle"></div>
        </div>
        <div class="usf-clear">
            <div class="usf-img"></div>
            <div class="usf-title"></div>
            <div class="usf-subtitle"></div>
        </div>
        <div class="usf-clear">
            <div class="usf-img"></div>
            <div class="usf-title"></div>
            <div class="usf-subtitle"></div>
        </div>
    </div>

    <!-- All JS files loaded -->
    <template v-else>
        <!-- Empty view -->
        <div v-if="isEmpty" class="usf-is__no-results">
            <div style="background:url('https://cdn.shopify.com/s/files/1/0257/0108/9360/t/60/assets/no-items.png?t=2') center no-repeat;min-height:160px"></div>
            <div v-html="usf.utils.format(loc.noMatchesFoundFor, term)"></div>
        </div>
        <template v-else>
            <!-- Body content -->
            <div class="usf-is__content">
                <!-- Products -->
                <div class="usf-is__matches">
                    <div class="usf-title" v-html="loc.productMatches"></div>
                    
                    <div class="usf-is__products" v-if="result.items.length">
                        <!-- Product -->
                        <usf-is-item v-for="p in result.items" :product="p" :result="result" :key="p.id + '-' + p.selectedVariantId"></usf-is-item>
                    </div>
                    <div class="usf-is__products" v-else style="background:url('https://cdn.shopify.com/s/files/1/0257/0108/9360/t/60/assets/no-products.png?t=2') center no-repeat;min-height:250px"></div>
                </div>

                <!-- Suggestions, Collections, Pages -->
                <div class="usf-is__suggestions">
                    <!-- Suggestions -->
                    <template v-if="result.suggestions && result.suggestions.length">
                        <div class="usf-title" v-html="loc.searchSuggestions"></div>
                        <span v-for="s in result.suggestions" class="usf-is__suggestion" v-html="usf.utils.highlight(s, result.query)" @click="search(s)"></span>
                    </template>
                    
                    <!-- Collections -->
                    <template v-if="result.collections && result.collections.length">
                        <div class="usf-title" v-html="loc.collections"></div>

                        <template v-if="result.collections">
                            <span v-for="c in result.collections" class="usf-is__suggestion" v-html="usf.utils.highlight(c.title, result.query)" @click="selectCollection(c)"></span>
                        </template>
                    </template>

                    <!-- Pages -->
                    <template v-if="result.pages && result.pages.length">
                        <div class="usf-title" v-html="loc.pages"></div>

                        <template v-if="result.pages">
                            <span v-for="p in result.pages" class="usf-is__suggestion" v-html="usf.utils.highlight(p.title, result.query)" @click="selectPage(p)"></span>
                        </template>
                    </template>
                </div>
            </div>

            <!-- Footer -->
            <div class="usf-is__viewall">
                <span @click="search(queryOrTerm)" v-html="usf.utils.format(queryOrTerm ? loc.viewAllResultsFor : loc.viewAllResults, queryOrTerm)"></span>
            </div>
            
            <!-- Loader -->
            <div v-if="loader" class="usf-is__loader">
                <div class="usf-spinner"></div>
            </div>
        </template>
    </template>
</div>`
    /*inc_end_instantsearch*/
    ,

    // Instant search item
    instantSearchItem:/*inc_begin_instantsearch-item*/
        `<span class="usf-is__product usf-clear" @click="onItemClick">
    <!-- Image -->
    <div class="usf-img-wrapper usf-pull-left">
        <img class="usf-img" :src="selectedImageUrl">
    </div>
    
    <div class="usf-pull-left">
        <!-- Title -->
        <div class="usf-title" v-html="usf.utils.highlight(product.title, result.query)"></div>

        <!-- Vendor -->
        <div class="usf-vendor" v-html="product.vendor" v-if="usf.settings.search.showVendor"></div>

        <!-- Prices -->
        <div class="usf-price-wrapper">
            <span class="usf-price" :class="{ 'usf-has-discount': hasDiscount }" v-html="displayPrice"></span>
            <span v-if="hasDiscount" class="usf-discount product-price__price product-price__sale" v-html="displayDiscountedPrice"></span>
        </div>
    </div>
</span>`
/*inc_end_instantsearch-item*/,
};

function _getImageMaxWidth(img) {
    var maxWidth = img.width;
    var aspect_ratio = _usfGetImageRatio(img);
    if (_usfGlobalSettings.align_height) {
        var maxHeight = _usfGlobalSettings.collection_height;
        if (maxHeight < img.height)
            maxWidth = maxHeight * aspect_ratio;
        else
            maxWidth = img.height * aspect_ratio;
    }
    if (maxWidth == 0)
        return `width:auto`;
    return `max-width:${maxWidth}px`
}

usf.event.add('init', function () {

    var nodes = document.head.children;
    for (var i = 0; i < nodes.length; i++) {
        var n = nodes[i];
        if (n.href && n.href.indexOf('style.css') !== -1) {
            usfAssetUrl = n.href.split('style.css')[0];
            usfFilesUrl = n.href;
            var m = usfFilesUrl.indexOf('/assets/');
            while (usfFilesUrl[--m] !== '/');
            while (usfFilesUrl[--m] !== '/');
            var k = usfFilesUrl.indexOf('?v=');
            usfFilesUrl = usfFilesUrl.substring(0, m) + "/files/";
            break;
        }
    }

    window._usfGlobalSettings = window._usfGlobalSettings || {
        custom_price0_text: "Free",
        align_height: false,
        collection_height: 200,
    };
    window._usfSectionSettings = window._usfSectionSettings || {
        collection_overlay: false,
        show_product_quantity: null,
        show_product_reviews_stars: false,
        show_grid_type: false,
        collection_overlay: false,
    };
    window._usf_grid_item_width = window._usf_grid_item_width || "3";
    window._usfVideoIcon = window._usfVideoIcon || usfAssetUrl + 'video-icon2.png';
    window._usf_qty_error = window._usf_qty_error || "Maximum quantity available reached.";
    _usfGlobalSettings.hide_price0_box_and_button = false;
    _usfSectionSettings.show_product_quantity = true;
    if(document.body.classList.contains('template-search')){
        document.body.classList.add('template-collection');
    }
    /**
* color swatch component
* */
    var UsfSwatches = {
        props: {
            value: Object,
        },
        data() {
            var product = this.value;
            return {
                product: product,
                colorRendereds: {},
                sizeRendereds: {},
                selectedVariant: this.$parent.selectedVariantForPrice
            }
        },
        methods: {
            _sizeValue(v) {
                var size = v.toLowerCase();
                switch (size) {
                    case 'small':
                        return 'S';
                    case 'medium':
                        return 'M';
                    case 'large':
                        return 'L';
                    case 'xlarge':
                        return 'XL';
                    case 'xxlarge':
                        return 'XXL';
                    default:
                        return v.toUpperCase();
                }
            },
            _createOptTag(option_index) {
                var styleTag = document.createElement('style');
                styleTag.innerHTML = `
                label[for="product-select-option-${option_index}"] { display: none; }
                #product-select-option-${option_index} { display: none; }
                #product-select-option-${option_index} + .custom-style-select-box { display: none !important; }`;
                document.body.appendChild(styleTag);

                var scriptTag = document.createElement('script');
                scriptTag.innerHTML = `$('.selector-wrapper:eq(${option_index})').addClass('hidden'); `;
                document.body.appendChild(scriptTag);

            },
            _createValueTag(option_index, val) {
                var scriptTag = document.createElement('script');
                scriptTag.innerHTML = `$('.swatch[data-option-index="${option_index}"] .${val}').removeClass('soldout').addClass('available').find(':radio').removeAttr('disabled');`;
                document.body.appendChild(scriptTag);
            }
        },
        render(h) {
            return h('div', { class: 'swatch-container' }, [
                this.product.options.map((option, opt_index) => {
                    var isColor = option.name.toLowerCase() == 'color' || option.name.toLowerCase() == 'colour';
                    //create script/style tag
                    this._createOptTag(opt_index);

                    return h('div', {
                        class: 'swatch',
                        attrs: {
                            'data-option-index': opt_index
                        }
                    }, [
                        h('div', { class: 'header' }, [option.name]),
                        this.product.variants.map(variant => {
                            if (variant.options[opt_index] != undefined) {
                                var value = option.values[variant.options[opt_index]];
                                var _sOut = usf.utils.isVariantSoldOut(variant);
                                if ((isColor && !this.colorRendereds[value]) || (!isColor && !this.sizeRendereds[value])) {
                                    isColor ? this.colorRendereds[value] = 1 : this.sizeRendereds[value] = 1;
                                    var isVariantSoldOut = usf.utils.isVariantSoldOut(variant);

                                    var valueHandled = _usfHandlezie(value);
                                    var valLastHandled = _usfHandlezie(value.split(' ').pop());
                                    if (!isVariantSoldOut)
                                        this._createValueTag(opt_index, valueHandled);

                                    return h('div', {
                                        attrs: {
                                            'data-value': value,
                                        },
                                        staticClass: 'swatch-element',
                                        class: {
                                            'color': isColor,
                                            'soldout': isVariantSoldOut,
                                            'available': !isVariantSoldOut
                                        }
                                    }, [
                                        isColor ? h('div', { class: 'tooltip' }, [value]) : null,
                                        h('input', {
                                            attrs: {
                                                id: `swatch-usf-collection-${this.product.id}-${opt_index}-${valueHandled}`,
                                                type: 'radio',
                                                name: `option-${opt_index}`,
                                                value: value,
                                                disabled: isVariantSoldOut,
                                                checked: this.selectedVariant.options[opt_index] != undefined && option.values[this.selectedVariant.options[opt_index]] == value
                                            }
                                        }),
                                        isColor ? h('label', {
                                            attrs: {
                                                for: `swatch-usf-collection-${this.product.id}-${opt_index}-${valueHandled}`,
                                            },
                                            style: `background-color: ${valLastHandled}; background-image: url(${usfFilesUrl + valLastHandled + '_100x.png'})`,
                                            on: {
                                                click: () => {
                                                    if (this.$parent.setSelectedVariantId(variant.id)) {
                                                        // reset lazyloaded elements
                                                        this.$parent.$el.querySelectorAll('.lazyloaded').forEach(el => el.classList.add('lazyload'));
                                                    }
                                                }
                                            }
                                        }) : h('label', {
                                            attrs: {
                                                for: `swatch-usf-collection-${this.product.id}-${opt_index}-${valueHandled}`,
                                                title: value.toUpperCase()
                                            },
                                            on: {
                                                click: () => {
                                                    if (this.$parent.setSelectedVariantId(variant.id)) {
                                                        // reset lazyloaded elements
                                                        this.$parent.$el.querySelectorAll('.lazyloaded').forEach(el => el.classList.add('lazyload'));
                                                    }
                                                }
                                            }
                                        }, [
                                            this._sizeValue(value)
                                        ]),
                                    ])

                                }
                            }

                        })
                    ])
                })
            ])
        }
    }
    usf.register(UsfSwatches, null, 'usf-swatches');


    usf.event.add(['sr_updated', 'sr_viewChanged', 'rerender'], function () {
        setTimeout(function () {
            var sections = new theme.Sections();
            sections.register('collection-page-section', theme.CollectionPageSection);
            enabledQuickView();
            initAddToCartForms();
            _initPlusMinusBtn();
        }, 100);
    });

});

function _usfPlayVideoInit() {

    /* ADD YOUTUBE IFRAME API */
    var tag = document.createElement('script');
    tag.id = 'iframe-api';
    tag.src = 'https://www.youtube.com/iframe_api';
    var firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

    var player;
    window.onYouTubeIframeAPIReady = function () {
        player = new YT.Player('player');
    }

    function videoPlayer(iframe, func, args) {
        if (iframe) {
        // Frame exists, 
        iframe.contentWindow.postMessage(JSON.stringify({
            "event": "command",
            "func": func,
            "args": args || [],
        }), "*");
        }
    }

    var windowWidth = window.innerWidth;
    var windowHeight = window.innerHeight;
    var mediaWidth;
    var mediaHeight;

    setMediaSize(windowWidth, windowHeight);

    window.addEventListener('resize', function (e) {
        windowWidth = e.target.innerWidth;
        windowHeight = e.target.innerHeight;
        setMediaSize(windowWidth, windowHeight);
    });

    function setMediaSize(windowWidth, windowHeight) {
        if (windowWidth > windowHeight) {
            mediaWidth = '60vw';
            mediaHeight = 60/16*9 + 'vw';
            $('.video_lightbox .media').css('width', mediaWidth);
            $('.video_lightbox .media').css('height', mediaHeight);
        } else {
            mediaWidth = '80vw';
            mediaHeight = 80/16*9 + 'vw';
            $('.video_lightbox .media').css('width', mediaWidth);
            $('.video_lightbox .media').css('height', mediaHeight);
        }
    }

    $(".play-video").on("click", function (e) {
        $(this).parent().find(".video_lightbox").removeClass("hidden");
    });
    $(".video_lightbox").on("click", function (e) {
        $(this).addClass("hidden");
        videoPlayer($(this).find('#player')[0], "pauseVideo");
    });
    $("body").on("keyup", function (e) {
    var currentLightbox = $(".video_lightbox").not(".hidden");
        if (e.key == "Escape" && $(".video_lightbox").not(".hidden")) {
            $(".video_lightbox").addClass("hidden");
            videoPlayer(currentLightbox.find('#player')[0], "pauseVideo");
        }
    });
}

function getVariantOption(options, p, title) {
    if (!p.options.length)
        return 'Default title'
    var arrs = [];
    for (let i = 0; i < options.length; i++) {
        var o = options[i];
        arrs.push(p.options[i].values[o])
    }
    return title ? arrs.join(' / ') : arrs.join('');
}



function _getTemplateHtml(el) {
    var handle = el.getAttribute('data-usf-template');
    if (!handle)
        return;
    if (_usfTemplates[handle]) {
        el.innerHTML = _usfTemplates[handle];
        el.removeAttribute('data-usf-template');
        _usfPlayVideoInit();
        return;
    }

    var xhr = new XMLHttpRequest();
    var url = `/products/${handle}?view=usf`;
    xhr.open("GET", url, true);
    xhr.setRequestHeader("Cache-Control", "max-age=3600");
    xhr.onreadystatechange = function () {
        if (this.readyState === XMLHttpRequest.DONE) {
            if (this.status === 200) {
                _usfTemplates[handle] = this.responseText;
                el.innerHTML = this.responseText;
                el.removeAttribute('data-usf-template');
                _usfPlayVideoInit();
            } else {
                console.log(this.status, this.statusText);
            }
        }
    };
    xhr.send();
}

function _getTemplates() {
    var els = document.querySelectorAll('#usf_container [data-usf-template]');
    for (el of els) {
        _getTemplateHtml(el)
    }
}
usf.event.add(['sr_updated', 'sr_viewChanged', 'rerender'], function () {
    setTimeout(function () {
        _getTemplates();
    }, 100);
});

usf.event.add('init', function () {
    usf.event.add(['sr_updated', 'sr_viewChanged', 'rerender'], function () {
        setTimeout(function () {
            _getTemplates();
            window.displayDiscountBadge();
        }, 1000);
    });
});

function _initPlusMinusBtn(){
    $('.add-to-cart-form').find(".plus_btn").click(function () {
    var inputEl = $(this).parent().find("input");
    var qty = inputEl.val()*1;
    
    
        var main_product_select = $(this).closest("form").find(".product-variants"),
            optionsLength = main_product_select.find("option").length;    
        var currentOption = main_product_select.find("option:selected");
        var variant_inventory_management = currentOption.attr("data-inventory_management") || null;
        var variant_inventory_policy = currentOption.attr("data-inventory_policy" ) || null;
        var variant_inventory_quantity = currentOption.attr("data-inventory_quantity")*1 || null;
            
        if (variant_inventory_management == "shopify" && variant_inventory_policy != "continue" && variant_inventory_quantity <= qty) {
        $(this).parent().find(".maximum-in-stock-error").show().delay(3000).fadeOut();
        inputEl.val(variant_inventory_quantity);     
        } else {
        qty++;
        inputEl.val(qty);
        }
    
    })

    $('.add-to-cart-form').find(".minus_btn").click(function () {
        var inputEl = $(this).parent().find("input");
        var qty = inputEl.val();
        if ($(this).parent().hasClass("minus_btn")) {
            qty++;
        } else {
            qty--;
        }
        if (qty <= 1) {
            qty = 1;
        }
        inputEl.val(qty);
    })
}