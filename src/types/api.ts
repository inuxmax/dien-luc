export interface Company {
  id_cong_ty: string;
  ten_cong_ty: string;
  zone: 'mien_bac' | 'mien_trung' | 'mien_nam';
  cong_ty_con: {
    ma_cong_ty_con: string;
    ten_cong_ty_con: string;
  }[];
}

export interface PowerOutageItem {
  id: number;
  ma_dien_luc: string;
  ten_dien_luc: string;
  ma_cong_ty_con: string;
  ten_cong_ty_con: string;
  thoi_gian_bat_dau: string;
  thoi_gian_ket_thuc: string;
  khu_vuc: string;
  ly_do: string;
}

export interface CompaniesResponse {
  success: boolean;
  data: {
    companies: Company[];
  };
}

export interface OutagesResponse {
  success: boolean;
  data: {
    items: PowerOutageItem[];
    pagination: {
      page: number;
      limit: number;
      totalItems: number;
      totalPages: number;
    };
  };
}

export interface Outage {
  id: number;
  company_id: number;
  title: string;
  content: string;
  start_at: string;
  end_at: string;
  created_at: string;
  updated_at: string;
  areas: string[];
  company: {
    id: number;
    name: string;
    slug: string;
    province: string;
    website: string;
    created_at: string;
    updated_at: string;
  };
} 