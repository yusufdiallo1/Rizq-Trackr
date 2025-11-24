'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

export type Language = 'en' | 'ar' | 'es' | 'fr';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  dir: 'ltr' | 'rtl';
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Translation keys
const translations: Record<Language, Record<string, string>> = {
  en: {
    // Navigation
    'nav.dashboard': 'Dashboard',
    'nav.income': 'Income',
    'nav.expenses': 'Expenses',
    'nav.savings': 'Savings',
    'nav.zakat': 'Zakat',
    'nav.transactions': 'Transactions',
    'nav.settings': 'Settings',
    'nav.changeLanguage': 'Change Language',
    'nav.logout': 'Logout',
    'nav.signedInAs': 'Signed in as',
    
    // Common
    'common.loading': 'Loading...',
    'common.save': 'Save',
    'common.cancel': 'Cancel',
    'common.delete': 'Delete',
    'common.edit': 'Edit',
    'common.add': 'Add',
    'common.close': 'Close',
    'common.apply': 'Apply',
    'common.clear': 'Clear',
    'common.yes': 'Yes',
    'common.no': 'No',
    'common.viewAll': 'View All',
    
    // Dashboard
    'dashboard.welcome': 'As-salamu alaykum',
    'dashboard.accountSummary': 'Account Summary',
    'dashboard.monthlyIncome': 'Monthly Income',
    'dashboard.monthlyExpenses': 'Monthly Expenses',
    'dashboard.accountBalance': 'Account Balance',
    'dashboard.zakatObligation': 'Zakat Obligation',
    'dashboard.totalSavings': 'Total savings',
    'dashboard.annualObligation': 'Annual obligation',
    'dashboard.vsPreviousMonth': 'vs previous month',
    'dashboard.payNow': 'Pay Now',
    'dashboard.belowNisab': 'Below Nisab',
    'dashboard.financialAnalysis': 'Financial Analysis',
    'dashboard.monthOverview': '6 Month Overview',
    'dashboard.spendingByCategory': 'Spending by Category',
    'dashboard.quickActions': 'Quick Actions',
    'dashboard.addIncome': 'Add Income',
    'dashboard.recordNewIncome': 'Record new income',
    'dashboard.addExpense': 'Add Expense',
    'dashboard.recordNewExpense': 'Record new expense',
    'dashboard.calculateZakat': 'Calculate Zakat',
    'dashboard.zakatCalculator': 'Zakat calculator',
    'dashboard.recentTransactions': 'Recent Transactions',
    'dashboard.noExpenseData': 'No expense data available',
    'dashboard.noTransactions': 'No transactions yet. Start by adding income or expenses!',
    
    // Income
    'income.title': 'Income Tracking',
    'income.subtitle': 'Monitor and manage your income sources',
    'income.addIncome': 'Add Income',
    'income.totalIncome': 'Total Income',
    'income.entries': 'Entries',
    'income.filters': 'Filters',
    'income.month': 'Month',
    'income.category': 'Category',
    'income.allMonths': 'All Months',
    'income.allCategories': 'All Categories',
    'income.showing': 'Showing',
    'income.noEntries': 'No income entries yet',
    'income.noEntriesDesc': 'Start tracking your income by adding your first entry. Monitor your earnings and stay on top of your finances.',
    'income.addFirstIncome': 'Add Your First Income',
    'income.date': 'Date',
    'income.amount': 'Amount',
    'income.zakatable': 'Zakatable',
    'income.notes': 'Notes',
    'income.actions': 'Actions',
    'income.loading': 'Loading income data...',
    
    // Expenses
    'expenses.title': 'Expense Tracking',
    'expenses.subtitle': 'Monitor your spending habits',
    'expenses.addExpense': 'Add Expense',
    'expenses.totalExpenses': 'Total Expenses',
    'expenses.entriesThisMonth': 'Entries this month',
    'expenses.topCategory': 'Top category',
    'expenses.noEntries': 'No expenses recorded yet',
    'expenses.noEntriesDesc': 'Start tracking your expenses by adding your first entry. Monitor your spending and stay on top of your finances.',
    'expenses.addFirstExpense': 'Add Your First Expense',
    'expenses.loading': 'Loading expense data...',
    'expenses.filters': 'Filters',
    'expenses.month': 'Month',
    'expenses.allMonths': 'All Months',
    'expenses.allCategories': 'All Categories',
    'expenses.date': 'Date',
    'expenses.amount': 'Amount',
    'expenses.notes': 'Notes',
    'expenses.actions': 'Actions',
    
    // Settings
    'settings.title': 'Settings',
    'settings.subtitle': 'Manage your account and preferences',
    'settings.profileSettings': 'Profile Settings',
    'settings.currencySettings': 'Currency Settings',
    'settings.notificationPreferences': 'Notification Preferences',
    'settings.securitySettings': 'Security Settings',
    'settings.dataPrivacy': 'Data & Privacy',
    'settings.appPreferences': 'App Preferences',
    'settings.loading': 'Loading settings...',
  },
  ar: {
    // Navigation
    'nav.dashboard': 'لوحة التحكم',
    'nav.income': 'الدخل',
    'nav.expenses': 'المصروفات',
    'nav.savings': 'التوفير',
    'nav.zakat': 'الزكاة',
    'nav.transactions': 'المعاملات',
    'nav.settings': 'الإعدادات',
    'nav.changeLanguage': 'تغيير اللغة',
    'nav.logout': 'تسجيل الخروج',
    'nav.signedInAs': 'تم تسجيل الدخول كـ',
    
    // Common
    'common.loading': 'جاري التحميل...',
    'common.save': 'حفظ',
    'common.cancel': 'إلغاء',
    'common.delete': 'حذف',
    'common.edit': 'تعديل',
    'common.add': 'إضافة',
    'common.close': 'إغلاق',
    'common.apply': 'تطبيق',
    'common.clear': 'مسح',
    'common.yes': 'نعم',
    'common.no': 'لا',
    'common.viewAll': 'عرض الكل',
    
    // Dashboard
    'dashboard.welcome': 'السلام عليكم',
    'dashboard.accountSummary': 'ملخص الحساب',
    'dashboard.monthlyIncome': 'الدخل الشهري',
    'dashboard.monthlyExpenses': 'المصروفات الشهرية',
    'dashboard.accountBalance': 'رصيد الحساب',
    'dashboard.zakatObligation': 'الزكاة المستحقة',
    'dashboard.totalSavings': 'إجمالي التوفير',
    'dashboard.annualObligation': 'الالتزام السنوي',
    'dashboard.vsPreviousMonth': 'مقارنة بالشهر السابق',
    'dashboard.payNow': 'ادفع الآن',
    'dashboard.belowNisab': 'أقل من النصاب',
    'dashboard.financialAnalysis': 'التحليل المالي',
    'dashboard.monthOverview': 'نظرة عامة على 6 أشهر',
    'dashboard.spendingByCategory': 'الإنفاق حسب الفئة',
    'dashboard.quickActions': 'إجراءات سريعة',
    'dashboard.addIncome': 'إضافة دخل',
    'dashboard.recordNewIncome': 'تسجيل دخل جديد',
    'dashboard.addExpense': 'إضافة مصروف',
    'dashboard.recordNewExpense': 'تسجيل مصروف جديد',
    'dashboard.calculateZakat': 'حساب الزكاة',
    'dashboard.zakatCalculator': 'حاسبة الزكاة',
    'dashboard.recentTransactions': 'المعاملات الأخيرة',
    'dashboard.noExpenseData': 'لا توجد بيانات مصروفات متاحة',
    'dashboard.noTransactions': 'لا توجد معاملات بعد. ابدأ بإضافة دخل أو مصروفات!',
    
    // Income
    'income.title': 'تتبع الدخل',
    'income.subtitle': 'مراقبة وإدارة مصادر دخلك',
    'income.addIncome': 'إضافة دخل',
    'income.totalIncome': 'إجمالي الدخل',
    'income.entries': 'الإدخالات',
    'income.filters': 'المرشحات',
    'income.month': 'الشهر',
    'income.category': 'الفئة',
    'income.allMonths': 'جميع الأشهر',
    'income.allCategories': 'جميع الفئات',
    'income.showing': 'عرض',
    'income.noEntries': 'لا توجد إدخالات دخل بعد',
    'income.noEntriesDesc': 'ابدأ في تتبع دخلك بإضافة أول إدخال. راقب أرباحك وابق على اطلاع بأموالك.',
    'income.addFirstIncome': 'أضف أول دخل لك',
    'income.date': 'التاريخ',
    'income.amount': 'المبلغ',
    'income.zakatable': 'قابل للزكاة',
    'income.notes': 'ملاحظات',
    'income.actions': 'الإجراءات',
    'income.loading': 'جاري تحميل بيانات الدخل...',
    
    // Expenses
    'expenses.title': 'تتبع المصروفات',
    'expenses.subtitle': 'راقب عادات إنفاقك',
    'expenses.addExpense': 'إضافة مصروف',
    'expenses.totalExpenses': 'إجمالي المصروفات',
    'expenses.entriesThisMonth': 'الإدخالات هذا الشهر',
    'expenses.topCategory': 'الفئة الأعلى',
    'expenses.noEntries': 'لم يتم تسجيل مصروفات بعد',
    'expenses.noEntriesDesc': 'ابدأ في تتبع مصروفاتك بإضافة أول إدخال. راقب إنفاقك وابق على اطلاع بأموالك.',
    'expenses.addFirstExpense': 'أضف أول مصروف لك',
    'expenses.loading': 'جاري تحميل بيانات المصروفات...',
    'expenses.filters': 'المرشحات',
    'expenses.month': 'الشهر',
    'expenses.allMonths': 'جميع الأشهر',
    'expenses.allCategories': 'جميع الفئات',
    'expenses.date': 'التاريخ',
    'expenses.amount': 'المبلغ',
    'expenses.notes': 'ملاحظات',
    'expenses.actions': 'الإجراءات',
    
    // Settings
    'settings.title': 'الإعدادات',
    'settings.subtitle': 'إدارة حسابك وتفضيلاتك',
    'settings.profileSettings': 'إعدادات الملف الشخصي',
    'settings.currencySettings': 'إعدادات العملة',
    'settings.notificationPreferences': 'تفضيلات الإشعارات',
    'settings.securitySettings': 'إعدادات الأمان',
    'settings.dataPrivacy': 'البيانات والخصوصية',
    'settings.appPreferences': 'تفضيلات التطبيق',
    'settings.loading': 'جاري تحميل الإعدادات...',
  },
  es: {
    // Navigation
    'nav.dashboard': 'Panel',
    'nav.income': 'Ingresos',
    'nav.expenses': 'Gastos',
    'nav.savings': 'Ahorros',
    'nav.zakat': 'Zakat',
    'nav.transactions': 'Transacciones',
    'nav.settings': 'Configuración',
    'nav.changeLanguage': 'Cambiar idioma',
    'nav.logout': 'Cerrar sesión',
    'nav.signedInAs': 'Conectado como',
    
    // Common
    'common.loading': 'Cargando...',
    'common.save': 'Guardar',
    'common.cancel': 'Cancelar',
    'common.delete': 'Eliminar',
    'common.edit': 'Editar',
    'common.add': 'Agregar',
    'common.close': 'Cerrar',
    'common.apply': 'Aplicar',
    'common.clear': 'Limpiar',
    'common.yes': 'Sí',
    'common.no': 'No',
    'common.viewAll': 'Ver todo',
    
    // Dashboard
    'dashboard.welcome': 'As-salamu alaykum',
    'dashboard.accountSummary': 'Resumen de cuenta',
    'dashboard.monthlyIncome': 'Ingresos mensuales',
    'dashboard.monthlyExpenses': 'Gastos mensuales',
    'dashboard.accountBalance': 'Saldo de cuenta',
    'dashboard.zakatObligation': 'Obligación de Zakat',
    'dashboard.totalSavings': 'Ahorros totales',
    'dashboard.annualObligation': 'Obligación anual',
    'dashboard.vsPreviousMonth': 'vs mes anterior',
    'dashboard.payNow': 'Pagar ahora',
    'dashboard.belowNisab': 'Por debajo de Nisab',
    'dashboard.financialAnalysis': 'Análisis financiero',
    'dashboard.monthOverview': 'Resumen de 6 meses',
    'dashboard.spendingByCategory': 'Gastos por categoría',
    'dashboard.quickActions': 'Acciones rápidas',
    'dashboard.addIncome': 'Agregar ingreso',
    'dashboard.recordNewIncome': 'Registrar nuevo ingreso',
    'dashboard.addExpense': 'Agregar gasto',
    'dashboard.recordNewExpense': 'Registrar nuevo gasto',
    'dashboard.calculateZakat': 'Calcular Zakat',
    'dashboard.zakatCalculator': 'Calculadora de Zakat',
    'dashboard.recentTransactions': 'Transacciones recientes',
    'dashboard.noExpenseData': 'No hay datos de gastos disponibles',
    'dashboard.noTransactions': 'Aún no hay transacciones. ¡Comienza agregando ingresos o gastos!',
    
    // Income
    'income.title': 'Seguimiento de ingresos',
    'income.subtitle': 'Monitorea y gestiona tus fuentes de ingresos',
    'income.addIncome': 'Agregar ingreso',
    'income.totalIncome': 'Ingresos totales',
    'income.entries': 'Entradas',
    'income.filters': 'Filtros',
    'income.month': 'Mes',
    'income.category': 'Categoría',
    'income.allMonths': 'Todos los meses',
    'income.allCategories': 'Todas las categorías',
    'income.showing': 'Mostrando',
    'income.noEntries': 'Aún no hay entradas de ingresos',
    'income.noEntriesDesc': 'Comienza a rastrear tus ingresos agregando tu primera entrada. Monitorea tus ganancias y mantén el control de tus finanzas.',
    'income.addFirstIncome': 'Agrega tu primer ingreso',
    'income.date': 'Fecha',
    'income.amount': 'Cantidad',
    'income.zakatable': 'Sujeto a Zakat',
    'income.notes': 'Notas',
    'income.actions': 'Acciones',
    'income.loading': 'Cargando datos de ingresos...',
    
    // Expenses
    'expenses.title': 'Seguimiento de gastos',
    'expenses.subtitle': 'Monitorea tus hábitos de gasto',
    'expenses.addExpense': 'Agregar gasto',
    'expenses.totalExpenses': 'Gastos totales',
    'expenses.entriesThisMonth': 'Entradas este mes',
    'expenses.topCategory': 'Categoría principal',
    'expenses.noEntries': 'Aún no se han registrado gastos',
    'expenses.noEntriesDesc': 'Comienza a rastrear tus gastos agregando tu primera entrada. Monitorea tus gastos y mantén el control de tus finanzas.',
    'expenses.addFirstExpense': 'Agrega tu primer gasto',
    'expenses.loading': 'Cargando datos de gastos...',
    'expenses.filters': 'Filtros',
    'expenses.month': 'Mes',
    'expenses.allMonths': 'Todos los meses',
    'expenses.allCategories': 'Todas las categorías',
    'expenses.date': 'Fecha',
    'expenses.amount': 'Cantidad',
    'expenses.notes': 'Notas',
    'expenses.actions': 'Acciones',
    
    // Settings
    'settings.title': 'Configuración',
    'settings.subtitle': 'Administra tu cuenta y preferencias',
    'settings.profileSettings': 'Configuración de perfil',
    'settings.currencySettings': 'Configuración de moneda',
    'settings.notificationPreferences': 'Preferencias de notificaciones',
    'settings.securitySettings': 'Configuración de seguridad',
    'settings.dataPrivacy': 'Datos y privacidad',
    'settings.appPreferences': 'Preferencias de la aplicación',
    'settings.loading': 'Cargando configuración...',
  },
  fr: {
    // Navigation
    'nav.dashboard': 'Tableau de bord',
    'nav.income': 'Revenus',
    'nav.expenses': 'Dépenses',
    'nav.savings': 'Épargne',
    'nav.zakat': 'Zakat',
    'nav.transactions': 'Transactions',
    'nav.settings': 'Paramètres',
    'nav.changeLanguage': 'Changer la langue',
    'nav.logout': 'Déconnexion',
    'nav.signedInAs': 'Connecté en tant que',
    
    // Common
    'common.loading': 'Chargement...',
    'common.save': 'Enregistrer',
    'common.cancel': 'Annuler',
    'common.delete': 'Supprimer',
    'common.edit': 'Modifier',
    'common.add': 'Ajouter',
    'common.close': 'Fermer',
    'common.apply': 'Appliquer',
    'common.clear': 'Effacer',
    'common.yes': 'Oui',
    'common.no': 'Non',
    'common.viewAll': 'Voir tout',
    
    // Dashboard
    'dashboard.welcome': 'As-salamu alaykum',
    'dashboard.accountSummary': 'Résumé du compte',
    'dashboard.monthlyIncome': 'Revenus mensuels',
    'dashboard.monthlyExpenses': 'Dépenses mensuelles',
    'dashboard.accountBalance': 'Solde du compte',
    'dashboard.zakatObligation': 'Obligation de Zakat',
    'dashboard.totalSavings': 'Épargne totale',
    'dashboard.annualObligation': 'Obligation annuelle',
    'dashboard.vsPreviousMonth': 'vs mois précédent',
    'dashboard.payNow': 'Payer maintenant',
    'dashboard.belowNisab': 'Sous Nisab',
    'dashboard.financialAnalysis': 'Analyse financière',
    'dashboard.monthOverview': 'Aperçu de 6 mois',
    'dashboard.spendingByCategory': 'Dépenses par catégorie',
    'dashboard.quickActions': 'Actions rapides',
    'dashboard.addIncome': 'Ajouter un revenu',
    'dashboard.recordNewIncome': 'Enregistrer un nouveau revenu',
    'dashboard.addExpense': 'Ajouter une dépense',
    'dashboard.recordNewExpense': 'Enregistrer une nouvelle dépense',
    'dashboard.calculateZakat': 'Calculer la Zakat',
    'dashboard.zakatCalculator': 'Calculateur de Zakat',
    'dashboard.recentTransactions': 'Transactions récentes',
    'dashboard.noExpenseData': 'Aucune donnée de dépenses disponible',
    'dashboard.noTransactions': 'Aucune transaction pour le moment. Commencez par ajouter des revenus ou des dépenses!',
    
    // Income
    'income.title': 'Suivi des revenus',
    'income.subtitle': 'Surveillez et gérez vos sources de revenus',
    'income.addIncome': 'Ajouter un revenu',
    'income.totalIncome': 'Revenus totaux',
    'income.entries': 'Entrées',
    'income.filters': 'Filtres',
    'income.month': 'Mois',
    'income.category': 'Catégorie',
    'income.allMonths': 'Tous les mois',
    'income.allCategories': 'Toutes les catégories',
    'income.showing': 'Affichage',
    'income.noEntries': 'Aucune entrée de revenus pour le moment',
    'income.noEntriesDesc': 'Commencez à suivre vos revenus en ajoutant votre première entrée. Surveillez vos gains et gardez le contrôle de vos finances.',
    'income.addFirstIncome': 'Ajoutez votre premier revenu',
    'income.date': 'Date',
    'income.amount': 'Montant',
    'income.zakatable': 'Soumis à la Zakat',
    'income.notes': 'Notes',
    'income.actions': 'Actions',
    'income.loading': 'Chargement des données de revenus...',
    
    // Expenses
    'expenses.title': 'Suivi des dépenses',
    'expenses.subtitle': 'Surveillez vos habitudes de dépenses',
    'expenses.addExpense': 'Ajouter une dépense',
    'expenses.totalExpenses': 'Dépenses totales',
    'expenses.entriesThisMonth': 'Entrées ce mois',
    'expenses.topCategory': 'Catégorie principale',
    'expenses.noEntries': 'Aucune dépense enregistrée pour le moment',
    'expenses.noEntriesDesc': 'Commencez à suivre vos dépenses en ajoutant votre première entrée. Surveillez vos dépenses et gardez le contrôle de vos finances.',
    'expenses.addFirstExpense': 'Ajoutez votre première dépense',
    'expenses.loading': 'Chargement des données de dépenses...',
    'expenses.filters': 'Filtres',
    'expenses.month': 'Mois',
    'expenses.allMonths': 'Tous les mois',
    'expenses.allCategories': 'Toutes les catégories',
    'expenses.date': 'Date',
    'expenses.amount': 'Montant',
    'expenses.notes': 'Notes',
    'expenses.actions': 'Actions',
    
    // Settings
    'settings.title': 'Paramètres',
    'settings.subtitle': 'Gérez votre compte et vos préférences',
    'settings.profileSettings': 'Paramètres de profil',
    'settings.currencySettings': 'Paramètres de devise',
    'settings.notificationPreferences': 'Préférences de notifications',
    'settings.securitySettings': 'Paramètres de sécurité',
    'settings.dataPrivacy': 'Données et confidentialité',
    'settings.appPreferences': 'Préférences de l\'application',
    'settings.loading': 'Chargement des paramètres...',
  },
};

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>('en');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (typeof window !== 'undefined') {
      const savedLanguage = localStorage.getItem('language') as Language | null;
      if (savedLanguage && ['en', 'ar', 'es', 'fr'].includes(savedLanguage)) {
        setLanguageState(savedLanguage);
      }
    }
  }, []);

  useEffect(() => {
    if (!mounted) return;
    if (typeof window !== 'undefined') {
      localStorage.setItem('language', language);
      document.documentElement.lang = language;
      document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    }
  }, [language, mounted]);

  const t = (key: string): string => {
    return translations[language]?.[key] || translations.en[key] || key;
  };

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
  };

  const dir = language === 'ar' ? 'rtl' : 'ltr';

  // Always provide the context, even during SSR/initial render
  // This prevents the "useLanguage must be used within a LanguageProvider" error
  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, dir }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}

