import { createRouter, createWebHistory } from 'vue-router'
import Login from '@/views/Login.vue'
import NotFound from '@/components/NotFound.vue' // 404 컴포넌트 임포트
import Cookies from 'js-cookie'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'login', // 'home' 대신 'login'으로 수정
      component: Login // 주석 제거
    },
    {
      path: '/',
      name: 'home',
      beforeEnter: (to, from, next) => {
        const isAuthenticated = !!Cookies.get('empAuthCode');
        if (isAuthenticated) {
          next({ name: 'dashboard' });
        } else {
          next({ name: 'login' });
        }
      }
    },
    {
      path: '/login',
      name: 'login',
      component: Login,
      meta: { requiresAuth: false } // 인증이 필요 없음을 명시
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: () => import('../views/Dashboard.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/mysales',
      name: 'mysales',
      component: () => import('../views/MySales.vue'),
      meta: { allowedAuthCodes: ['AUTH001'] } //영업사원만 접속
    },
    {
      path: '/system',
      name: 'system',
      component: () => import('../views/SystemView/SystemLayout.vue'), // SystemLayout.vue 추가
      meta: { requiresAuth: true },
      children: [
        {
          path: 'employeesspec',
          name: 'employeesspec',
          component: () => import('../views/SystemView/EmployeesSpec.vue'),
          meta: { allowedAuthCodes: ['AUTH001', 'AUTH002', 'AUTH003'] }//팀장 이상만 접속
        },
        {
          path: 'employeeslist',
          name: 'employeeslist',
          component: () => import('../views/SystemView/EmployeesList.vue'),
          meta: { allowedAuthCodes: ['AUTH001', 'AUTH002'] }//대표 이상만 접속
        },
        {
          path: 'templog',
          name: 'templog',
          component: () => import('../views/SystemView/TempLog.vue')
        }
      ]
    },
    {
      path: '/product',
      name: 'product',
      component: () => import('../views/ProductView/ProductLayout.vue'), // ProductLayout.vue 추가
      meta: { requiresAuth: true },
      children: [
        {
          path: 'viewproduct',
          name: 'viewproduct',
          component: () => import('../views/ProductView/ViewProduct.vue')
        },
        {
          path: 'ppccrud',
          name: 'ppccrud',
          component: () => import('../views/ProductView/PpcCrud.vue'),
          meta: { allowedAuthCodes: ['AUTH001', 'AUTH002', 'AUTH003'] }//팀장 이상만 접속
        },
        {
          path: 'ppcview',
          name: 'ppcview',
          component: () => import('../views/ProductView/PpcView.vue')
        },
        {
          path: 'stockList',
          name: 'stockList',
          component: () => import('../views/ProductView/StockList.vue'),
          meta: { allowedAuthCodes: ['AUTH001', 'AUTH002', 'AUTH003'] }//팀장 이상만 접속
        },
        {
          path: 'vouchersave',
          name: 'vouchersave',
          component: () => import('../views/ProductView/VoucherSave.vue'),
          meta: { allowedAuthCodes: ['AUTH001', 'AUTH004'] } //영업사원과 IT관리자만 접속
        },
        {
          path: 'viewvoucher',
          name: 'viewvoucher',
          component: () => import('../views/ProductView/ViewVoucher.vue')
        },
        {
          path: 'voucherdetail/:voucherID',
          name: 'VoucherDetail',
          component: () => import('../views/ProductView/VoucherDetail.vue')
        }
      ]
    },
    {
      path: '/sales',
      name: 'sales',
      component: () => import('../views/SalesView/SalesLayout.vue'), // SalesLayout.vue 추가
      meta: { requiresAuth: true },
      children: [
        {
          path: 'productsales',
          name: 'productsales',
          component: () => import('../views/SalesView/ProductSales.vue')
        },
        {
          path: 'clientsales',
          name: 'clientSales',
          component: () => import('../views/SalesView/ClientSales.vue')
        },
      ]
    },
    {
      path: '/business',
      name: 'business',
      component: () => import('../views/BusinessView/BusinessLayout.vue'), // BusinessLayout.vue 추가
      meta: { requiresAuth: true },
      children: [
        {
          path: 'incentivelist',
          name: 'incentivelist',
          component: () => import('../views/BusinessView/IncentiveList.vue'),
          meta: { allowedAuthCodes: ['AUTH001', 'AUTH002', 'AUTH003'] }//팀장 이상만 접속
        },
        {
          path: 'clientsave',
          name: 'clientsave',
          component: () => import('../views/BusinessView/Clientsave.vue'),
          meta: { allowedAuthCodes: ['AUTH001', 'AUTH002', 'AUTH003'] }//팀장 이상만 접속
        },
        {
          path: 'viewclient',
          name: 'viewclient',
          component: () => import('../views/BusinessView/ViewClient.vue')
        },
        {
          path: 'ClientDetail/:clientCode',
          name: 'ClientDetail',
          component: () => import('../views/BusinessView/ClientDetail.vue'),
          meta: { allowedAuthCodes: ['AUTH001', 'AUTH002', 'AUTH003'] }//팀장 이상만 접속
        },
      ]
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: NotFound,
    },
  ]
})


// AUTH000, AUTH001, AUTH002, AUTH003,  AUTH004
// 퇴사자, IT관리자, 경영관리자, 영업팀장, 영업사원
//전역 가드를 사용한 사용자 인증과 권한 확인
router.beforeEach((to, from, next) => { //페이지를 이동하기 전에 매번 호출되는 전역 가드 함수
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth); //라우터의 인증 요구 여부 확인
  const allowedAuthCodes = to.matched.some(record => record.meta.allowedAuthCodes) ? 
  to.matched.find(record => record.meta.allowedAuthCodes).meta.allowedAuthCodes : null; //허용된 권한 코드 확인
  const isAuthenticated = !!Cookies.get('empAuthCode'); //사용자 인증 상태 확인
  const userAuthCode = Cookies.get('empAuthCode'); //사용자 권한 코드 확인

  if (requiresAuth && !isAuthenticated) {
    //인증이 필요하지만 사용자가 인증되지 않았다면, 로그인 페이지로 리디렉션
    next({ name: 'login' });
  } else if (requiresAuth && isAuthenticated && allowedAuthCodes && !allowedAuthCodes.includes(userAuthCode)) {
    // 사용자가 인증되었으나 필요한 권한 코드를 가지고 있지 않은 경우
    alert('해당 메뉴의 접근 권한이 없습니다.');
    next(false);
  } else {
    // 그 외의 경우 정상적으로 라우트 이동 처리
    next();
  }
});

export default router