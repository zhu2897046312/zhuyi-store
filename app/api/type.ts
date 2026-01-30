
export interface Category {
    id: number;
    pid: number;
    title: string;
    code: string;
    state: number;
    icon: string;
    picture: string;
    description: string;
    sort_num: number;
    seo_title: string;
    seo_keyword: string;
    seo_description: string;
    created_time: string;
    updated_time: string;
    deleted_time: string | null;
}

export interface ProductItem {
    id: number;
    category_id: number;
    title: string;
    state: number;
    price: number;
    original_price: number;
    cost_price: number;
    stock: number;
    picture: string;
    sold_num: number;
    sort_num: number;
    putaway_time: string;
    open_sku: number; // 根据数据是 number 类型
    created_time: string;
    updated_time: string;
    category: Category | null;
}

// 商品列表响应类型
export interface ProductListResponse {
  list: ProductItem[];
  total: number;
}

export type ProductList = ProductItem[];


// type.ts
export interface MarketInfo {
    exchange: string; // 汇率值
    freight: string;   // 运费
    original: string;  // 原始货币值或标识
    seo_title : string;
    seo_keyword : string;
    seo_description : string;
}

// type.ts
export interface CartItem {
    id: number;
    user_id: number;
    product_id: number;
    sku_id: number;
    fingerprint: string;
    title: string;
    sku_title: string;
    sku_code: string;
    thumb: string;
    total_amount: number;
    pay_amount: number;
    quantity: number;
    price: number;
    original_price: number;
    created_time: string;
    updated_time: string;
    deleted_time: string | null;
  }
  
  // 购物车商品列表类型
  export type CartList = CartItem[];

  // type.ts
export interface DocumentItem {
    id: number;
    title: string;
    category_id: number;
    associated_placeId: number;
    user_id: number;
    admin_id: number;
    cont_tpl: string;
    keyword: string;
    description: string;
    thumb: string;
    state: number;
    link_type: number;
    link: string;
    document_type: number;
    video_duration: number;
    send_time: string | null;
    author: string;
    source: string;
    read_num: number;
    like_num: number;
    sort_num: number;
    created_time: string;
    updated_time: string;
    deleted_time: string | null;
    code: string;
  }
  
  // 文档列表类型
  export type DocumentList = DocumentItem[];

  // export interface SkuConfigItem {
  //   id: number;
  //   product_id: number;
  //   sku_id: number;
  //   prod_attributes_id: number;
  //   prod_attributes_value_id: number;
  //   created_time: string; // ISO 8601 格式的时间字符串
  //   updated_time: string; // ISO 8601 格式的时间字符串
  // }

  // export type SkuConfigList = SkuConfigItem[];

  // 商品状态枚举
export enum SpProductStatus {
    ONLINE = 1, // 上线
    OFFLINE = 2, // 下线
    PENDING_REVIEW = 3, // 待审核
    REVIEW_FAILED = 4, // 审核不通过
  }
  
  // SKU 是否开启枚举
  export enum SpProductOpenSku {
    CLOSED = 0, // 未开启（根据常见约定，0通常表示关闭）
    OPENED = 1, // 已开启
  }
  
  // SKU 默认显示枚举
  export enum SpProductSkuDefaultShow {
    NOT_DEFAULT = 0, // 非默认显示
    DEFAULT = 1, // 默认显示
  }
  
  // SKU 状态枚举
  export enum SpProductSkuStatus {
    ENABLED = 1, // 启用
    DISABLED = 2, // 停用
  }
  
  // 标签状态枚举
  export enum SpTagStatus {
    PUBLISHED = 1, // 已发布
    UNPUBLISHED = 2, // 未发布
  }
  
  // 标签实体
  export interface SpTagEntity {
    id: number;
    title: string;
    code: string;
    thumb: string;
    state: SpTagStatus;
    read_num: number;
    sort_num: number;
    created_time: string;
    updated_time: string;
    deleted_time: string | null;
    match_word: string;
  }


// 单个地址的数据类型
export interface Address {
  id: number;
  title: string;
  default_status: number;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  province: string;
  city: string;
  region: string;
  detail_address: string;
  created_time: string; // 或者可以使用 Date 类型，但需要转换
  updated_time: string; // 或者可以使用 Date 类型，但需要转换
  country: string;
  postal_code: string;
};

export type AddressList = Address[];

// 地址列表响应的数据类型
export interface AddressListResponse {
  address: Address;
  total: number;
};

// ========== API 请求参数类型 ==========

// 分类相关请求参数
export interface CategoryGetInfoByCodeParams {
  code: string;
}

export interface CategoryGetParentsParams {
  code: string;
}

// 商品相关请求参数
export interface ProductListParams {
  page_no?: number;
  page_size?: number;
  category_id?: number;
  keyword?: string;
  [key: string]: unknown; // 允许其他可选参数
}

// 用户认证相关请求参数
export interface UserRegisterParams {
  email: string;
  username: string;
  password: string;
}

export interface UserLoginParams {
  email: string;
  password: string;
}

export interface UserSendEmailParams {
  email: string;
}

export interface UserResetPwdParams {
  email: string;
  code: string;
  password: string;
}

// 购物车相关请求参数
export interface CartActParams {
  product_id: number;
  sku_id: number;
  quantity: number;
  add: boolean;
}

// 地址相关请求参数
export interface AddressListParams {
  page_no?: number;
  page_size?: number;
  [key: string]: unknown;
}

export interface AddressCreateParams {
  title: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  province: string;
  city: string;
  region?: string;
  detail_address: string;
  country: string;
  postal_code: string;
  default_status?: number;
}

export interface AddressModifyParams extends AddressCreateParams {
  id: number;
}

// 订单相关请求参数
export interface OrderProductItem {
  product_id: number;
  quantity: number;
  sku_id: number;
}

export interface OrderCreateParams {
  product_items: OrderProductItem[];
  pay_type: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  province: string;
  country: string;
  city: string;
  postal_code: string;
  detail_address: string;
}

export interface OrderListParams {
  page_no?: number;
  page_size?: number;
  status?: number;
  [key: string]: unknown;
}

export interface OrderGetPaymentUrlParams {
  order_id: string;
  pay_type: string;
}

export interface OrderCaptureOrderParams {
  orderId: string;
  [key: string]: unknown;
}

// 市场相关请求参数
export interface MarketBreadcrumbParams {
  code: string;
  type?: string;
  [key: string]: unknown;
}

// 标签相关请求参数
export interface TagProductListParams {
  page_no?: number;
  page_size?: number;
  code: string;
  [key: string]: unknown;
}

// 文档相关请求参数
export interface DocumentListParams {
  page_no?: number;
  page_size?: number;
  category_id?: number;
  keyword?: string;
  [key: string]: unknown;
}

// 通用类型（根据项目中 common 包的习惯推测）
type MyID = number;           // 可能是 string化的雪花ID / uint64 / int64
type MyState = number;                 // 通常 0 = 禁用/关闭, 1 = 启用/开启
type MyNumber = number;                // 用于 stock、销量、阅读数等
type MySortNum = number;

// ────────────────────────────────────────────────
// 商品主信息
export interface Product {
  id: MyID;
  category_id: MyID;
  title: string;
  state: MyState;
  price: number;                  // decimal(10,2)
  original_price: number;
  cost_price: number;
  stock: MyNumber;
  open_sku: MyState;              // 是否开启规格 0/1
  picture: string;                // 主图 URL
  picture_gallery: string[];      // 详情图列表（后端 json.RawMessage 通常转为 string[]）
  description: string;            // 简短描述（200字符限制）
  sold_num: MyNumber;
  version: number;
  sort_num: MySortNum;
  hot: number;                    // uint8，通常 0 或 1
  putaway_time: string | null;    // ISO8601 或 null
  created_time: string;
  updated_time: string;
  deleted_time: string | null;
  detail_url: string;             // 商品详情页链接（H5/PC）
  price_locked: boolean;
}

// ────────────────────────────────────────────────
// 商品详情富文本内容（独立表）
export interface ProductContent {
  id: MyID;
  product_id: MyID;
  content: string;                // 富文本 HTML / Markdown
  seo_title: string;
  seo_keyword: string;
  seo_description: string;
  created_time: string;
  updated_time: string;
}

// ────────────────────────────────────────────────
// 商品属性（规格参数 / 关键卖点）
export interface ProductProperty {
  id: MyID;
  product_id: MyID;
  title: string;                  // 如：材质、重量、产地
  value: string;                  // 如：棉、500g、中国
  sort_num: MySortNum;
  created_time: string;
  updated_time: string;
}

// ────────────────────────────────────────────────
// SKU（单品规格）
export interface Sku {
  id: MyID;
  product_id: MyID;
  sku_code: string;               // 商家编码
  title: string;                  // 如：白色-36码
  price: number;
  original_price: number;
  cost_price: number;
  stock: MyNumber;
  default_show: MyState;          // 是否默认展示该 SKU（0/1）
  state: MyState;
  version: number;
  created_time: string;
  updated_time: string;
  deleted_time: string | null;
}

// SKU 的属性组合索引（用于前端规格选择器）
export interface SkuConfigItem {
  id: MyID;
  product_id: MyID;
  sku_id: MyID;
  prod_attributes_id: MyID;         // 属性组ID（如颜色、尺码）
  prod_attributes_value_id: MyID;   // 属性值ID（如红色、XL）
  created_time: string;
  updated_time: string;
}

// 注意：这里 sku_config_list 通常是一个数组，里面的每一项代表一条 规格-值 的对应关系
// 前端常用来构建规格选择矩阵

// ────────────────────────────────────────────────
// 店铺/商品标签（活动标签、推荐标签等）
export interface ShopTag {
  id: MyID;
  title: string;
  code: string;                   // 标签唯一码
  thumb: string;                  // 标签小图标
  state: MyState;
  read_num: MyNumber;
  sort_num: MySortNum;
  created_time: string;
  updated_time: string;
  deleted_time: string | null;
  match_word: string;             // 匹配关键词（可能用于搜索）
}

// SKU 配置值类型
export interface SkuConfigValue {
  id: MyID;
  title: string;
  sort_num: MySortNum;
}

// SKU 配置类型（用于前端规格选择器）
export interface SkuConfig {
  id: MyID;
  title: string;
  sort_num: MySortNum;
  value: SkuConfigValue[];
}

/**
 * 商品详情页接口返回的 result 数据结构（扁平化结构）
 */
export interface ProductDetailData {
  /** 商品ID */
  id: MyID;
  
  /** 分类ID */
  category_id: MyID;
  
  /** 商品标题 */
  title: string;
  
  /** 商品状态 */
  state: MyState;
  
  /** 商品价格 */
  price: number;
  
  /** 商品原价 */
  original_price: number;
  
  /** 成本价 */
  cost_price?: number;
  
  /** 库存 */
  stock: MyNumber;
  
  /** 是否开启SKU */
  open_sku: MyState;
  
  /** 主图URL */
  picture: string;
  
  /** 详情图列表 */
  picture_gallery: string[];
  
  /** 简短描述 */
  description: string;
  
  /** 销量 */
  sold_num: MyNumber;
  
  /** 排序号 */
  sort_num: MySortNum;
  
  /** 上架时间 */
  putaway_time: string;
  
  /** 商品详情富文本内容（HTML/Markdown） */
  content: string;
  
  /** SEO标题 */
  seo_title: string;
  
  /** SEO关键词 */
  seo_keyword: string;
  
  /** SEO描述 */
  seo_description: string;
  
  /** 商品属性参数列表（如：产地、材质、规格参数等） */
  property_list: ProductProperty[];
  
  /** 该商品的所有 SKU */
  sku_list: Sku[];
  
  /** SKU 配置（用于前端规格选择器构建） */
  sku_config: SkuConfig[];
  
  /** 商品关联的标签（促销标签、推荐标签等），可能为 null */
  tags: ShopTag[] | null;
}