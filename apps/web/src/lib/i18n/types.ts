export type Locale = "fr" | "en";

export type TranslationKeys = {
  // ─── Landing ─────────────────────────────────────────────────
  "landing.hero.punchline1": string;
  "landing.hero.punchline2": string;
  "landing.hero.subtitle": string;
  "landing.hero.cta": string;
  "landing.hero.login": string;
  "landing.hero.dashboard": string;
  "landing.nav.about": string;
  "landing.nav.features": string;
  "landing.nav.login": string;
  "landing.nav.signup": string;
  "landing.nav.dashboard": string;
  "landing.about.title": string;
  "landing.about.description": string;
  "landing.showcase.eyebrow": string;
  "landing.showcase.title": string;
  "landing.showcase.description": string;
  "landing.showcase.feat1.eyebrow": string;
  "landing.showcase.feat1.title": string;
  "landing.showcase.feat1.desc": string;
  "landing.showcase.feat1.bullet1": string;
  "landing.showcase.feat1.bullet2": string;
  "landing.showcase.feat1.bullet3": string;
  "landing.showcase.feat2.eyebrow": string;
  "landing.showcase.feat2.title": string;
  "landing.showcase.feat2.desc": string;
  "landing.showcase.feat2.bullet1": string;
  "landing.showcase.feat2.bullet2": string;
  "landing.showcase.feat2.bullet3": string;
  "landing.showcase.feat3.eyebrow": string;
  "landing.showcase.feat3.title": string;
  "landing.showcase.feat3.desc": string;
  "landing.showcase.feat3.bullet1": string;
  "landing.showcase.feat3.bullet2": string;
  "landing.showcase.feat3.bullet3": string;
  "landing.integrations.eyebrow": string;
  "landing.integrations.title": string;
  "landing.integrations.description": string;
  "landing.features.title": string;
  "landing.features.subtitle": string;
  "landing.features.journal.title": string;
  "landing.features.journal.desc": string;
  "landing.features.calendar.title": string;
  "landing.features.calendar.desc": string;
  "landing.features.stats.title": string;
  "landing.features.stats.desc": string;
  "landing.features.accounts.title": string;
  "landing.features.accounts.desc": string;
  "landing.features.import.title": string;
  "landing.features.import.desc": string;
  "landing.features.darkMode.title": string;
  "landing.features.darkMode.desc": string;
  "landing.footer.tagline": string;
  "landing.footer.rights": string;
  "landing.stats.tradesAnalyzed": string;
  "landing.stats.tradersOnboard": string;
  "landing.stats.brokersIntegrated": string;
  "landing.stats.dataPoints": string;
  "landing.cta.headline": string;
  "landing.cta.subtitle": string;
  "landing.cta.button": string;
  "landing.hero.socialProof": string;
  "landing.chartReview.eyebrow": string;
  "landing.chartReview.title": string;
  "landing.chartReview.description": string;
  "landing.chartReview.bullet1": string;
  "landing.chartReview.bullet2": string;
  "landing.chartReview.bullet3": string;
  "landing.statsSection.eyebrow": string;
  "landing.statsSection.title": string;
  "landing.statsSection.description": string;
  "landing.statsSection.bullet1": string;
  "landing.statsSection.bullet2": string;
  "landing.statsSection.bullet3": string;
  "landing.upcoming.title": string;
  "landing.upcoming.description": string;

  // ─── Auth ────────────────────────────────────────────────────
  "auth.login.title": string;
  "auth.login.subtitle": string;
  "auth.login.email": string;
  "auth.login.password": string;
  "auth.login.submit": string;
  "auth.login.submitting": string;
  "auth.login.or": string;
  "auth.login.noAccount": string;
  "auth.login.signupLink": string;
  "auth.login.google": string;
  "auth.signup.title": string;
  "auth.signup.subtitle": string;
  "auth.signup.email": string;
  "auth.signup.password": string;
  "auth.signup.submit": string;
  "auth.signup.submitting": string;
  "auth.signup.hasAccount": string;
  "auth.signup.loginLink": string;
  "auth.signup.success": string;
  "auth.signup.google": string;

  // ─── Sidebar / Nav ──────────────────────────────────────────
  "nav.dashboard": string;
  "nav.calendar": string;
  "nav.journal": string;
  "nav.stats": string;
  "nav.accounts": string;
  "nav.profile": string;
  "nav.more": string;
  "nav.collapse": string;
  "nav.expand": string;

  // ─── Theme ──────────────────────────────────────────────────
  "theme.dark": string;
  "theme.light": string;

  // ─── Logout ─────────────────────────────────────────────────
  "logout.button": string;
  "logout.tooltip": string;

  // ─── Account Switcher ───────────────────────────────────────
  "accountSwitcher.label": string;

  // ─── Dashboard ──────────────────────────────────────────────
  "dashboard.title": string;
  "dashboard.greeting.morning": string;
  "dashboard.greeting.afternoon": string;
  "dashboard.greeting.evening": string;

  // ─── KPI Cards ──────────────────────────────────────────────
  "kpi.netPnl": string;
  "kpi.winRate": string;
  "kpi.profitFactor": string;
  "kpi.totalTrades": string;
  "kpi.bestTrade": string;
  "kpi.worstTrade": string;
  "kpi.avgWin": string;
  "kpi.avgLoss": string;
  "kpi.expectancy": string;

  // ─── Charts ─────────────────────────────────────────────────
  "charts.cumulativePnl": string;
  "charts.cumulative": string;
  "charts.latestSession": string;
  "charts.noClosedTrades": string;
  "charts.dailyPnl14d": string;
  "charts.noData": string;
  "charts.runningNet": string;
  "charts.openClosed": string;
  "charts.accounts": string;
  "charts.daily": string;
  "charts.return": string;
  "charts.trades": string;

  // ─── Recent Trades ──────────────────────────────────────────
  "recentTrades.title": string;
  "recentTrades.symbol": string;
  "recentTrades.side": string;
  "recentTrades.qty": string;
  "recentTrades.netPnl": string;
  "recentTrades.empty": string;

  // ─── Journal ────────────────────────────────────────────────
  "journal.title": string;
  "journal.newEntry": string;
  "journal.loading": string;
  "journal.emptyTitle": string;
  "journal.emptyDesc": string;
  "journal.emptyAction": string;
  "journal.noNote": string;

// ─── Calendar ───────────────────────────────────────────────
  "calendar.title": string;
  "calendar.description": string;
  "calendar.importTrades": string;
  "calendar.prevMonth": string;
  "calendar.nextMonth": string;
  "calendar.date": string;
  "calendar.loading": string;
  "calendar.days.mon": string;
  "calendar.days.tue": string;
  "calendar.days.wed": string;
  "calendar.days.thu": string;
  "calendar.days.fri": string;
  "calendar.days.sat": string;
  "calendar.days.sun": string;
  "calendar.selectedDay": string;
  "calendar.addTrade": string;
  "calendar.noTrades": string;
  "calendar.view": string;
  "calendar.edit": string;
  "calendar.deleteConfirm": string;

  // ─── Stats ──────────────────────────────────────────────────
  "stats.title": string;
  "stats.metrics.netPnl": string;
  "stats.metrics.netPnlDesc": string;
  "stats.metrics.netPnlNote": string;
  "stats.metrics.expectancy": string;
  "stats.metrics.expectancyDesc": string;
  "stats.metrics.expectancyNote": string;
  "stats.metrics.maxDrawdown": string;
  "stats.metrics.maxDrawdownDesc": string;
  "stats.metrics.maxDrawdownNote": string;
  "stats.metrics.avgHolding": string;
  "stats.metrics.avgHoldingDesc": string;
  "stats.metrics.avgHoldingNote": string;
  "stats.metrics.bestWorst": string;
  "stats.metrics.bestWorstDesc": string;
  "stats.metrics.bestTrade": string;
  "stats.metrics.bestTradeNote": string;
  "stats.metrics.worstTrade": string;
  "stats.metrics.worstTradeNote": string;
  "stats.metrics.streakSnapshot": string;
  "stats.metrics.streakSnapshotDesc": string;
  "stats.metrics.winStreak": string;
  "stats.metrics.lossStreak": string;
  "stats.metrics.worstRun": string;
  "stats.breakdown.title": string;
  "stats.breakdown.desc": string;
  "stats.breakdown.subtitle": string;
  "stats.breakdown.cols.group": string;
  "stats.breakdown.cols.trades": string;
  "stats.breakdown.cols.winRate": string;
  "stats.breakdown.cols.net": string;
  "stats.breakdown.cols.pf": string;
  "stats.breakdown.cols.avgR": string;
  "stats.breakdown.options.symbol": string;
  "stats.breakdown.options.setupName": string;
  "stats.breakdown.options.strategyTag": string;
  "stats.breakdown.options.assetClass": string;
  "stats.breakdown.options.side": string;
  "stats.breakdown.options.entryTimeframe": string;
  "stats.breakdown.options.planFollowed": string;
  "stats.breakdown.options.executionRating": string;
  "stats.distribution.title": string;
  "stats.distribution.desc": string;
  "stats.distribution.subtitle": string;
  "stats.distribution.emptyRMultiple": string;
  "stats.distribution.emptyHolding": string;
  "stats.distribution.emptyDefault": string;
  "stats.distribution.avg": string;
  "stats.distribution.median": string;
  "stats.distribution.min": string;
  "stats.distribution.max": string;
  "stats.distribution.samples": string;
  "stats.distribution.unit": string;
  "stats.distribution.options.pnl": string;
  "stats.distribution.options.rMultiple": string;
  "stats.distribution.options.holdingTime": string;
  "stats.timeAnalysis.weekdayEdge": string;
  "stats.timeAnalysis.weekdayEdgeDesc": string;
  "stats.timeAnalysis.bestWindows": string;
  "stats.timeAnalysis.bestWindowsDesc": string;
  "stats.timeAnalysis.bestWeekday": string;
  "stats.timeAnalysis.bestHour": string;
  "stats.timeAnalysis.streaks": string;
  "stats.timeAnalysis.streaksDesc": string;
  "stats.timeAnalysis.seasonality": string;
  "stats.timeAnalysis.seasonalityDesc": string;

  // ─── Profile ────────────────────────────────────────────────
  "profile.title": string;
  "profile.identity": string;
  "profile.displayName": string;
  "profile.email": string;
  "profile.timezone": string;
  "profile.notSet": string;
  "profile.accountOverview": string;
  "profile.tradingAccounts": string;
  "profile.memberSince": string;

  // ─── Accounts ───────────────────────────────────────────────
  "accounts.title": string;
  "accounts.tradingAccounts": string;
  "accounts.description": string;
  "accounts.closeBtn": string;
  "accounts.addAccountBtn": string;
  "accounts.noAccounts": string;
  "accounts.createFirstAccount": string;
  "accounts.addFirstAccountBtn": string;
  "accounts.balance": string;
  "accounts.pnl": string;
  "accounts.broker": string;
  "accounts.notSet": string;
  "accounts.startingCapital": string;
  "accounts.created": string;
  "accounts.editBtn": string;
  "accounts.deleteBtn": string;
  "accounts.deletingBtn": string;
  "accounts.editAccountTitle": string;
  "accounts.addAccountTitle": string;
  "accounts.editAccountDesc": string;
  "accounts.addAccountDesc": string;
  "accounts.formName": string;
  "accounts.formNamePlaceholder": string;
  "accounts.formBroker": string;
  "accounts.formBrokerPlaceholder": string;
  "accounts.formCurrency": string;
  "accounts.formCurrencyPlaceholder": string;
  "accounts.formType": string;
  "accounts.formInitialBalance": string;
  "accounts.formInitialBalancePlaceholder": string;
  "accounts.formInitialBalanceHelp": string;
  "accounts.formSaveBtn": string;
  "accounts.formCreatingBtn": string;
  "accounts.formSavingBtn": string;
  "accounts.formCreateBtn": string;
  "accounts.formCancelBtn": string;
  "accounts.emptySelectionText": string;
  "accounts.clickAdd": string;
  "accounts.toOpenForm": string;
  "accounts.orChoose": string;
  "accounts.onExisting": string;
  "accounts.deleteConfirm": string;
  "accounts.deleteSuccess": string;
  "accounts.createSuccess": string;
  "accounts.updateSuccess": string;


  "tradeDetail.previous": string;
  "tradeDetail.next": string;

  // ─── Journal Modal ──────────────────────────────────────────
  "journalModal.title": string;
  "journalModal.cancel": string;
  "journalModal.saving": string;
  "journalModal.save": string;
  "journalModal.loading": string;
  "journalModal.notesPlaceholder": string;
  "journalModal.preMarket": string;
  "journalModal.economicEvents": string;
  "journalModal.addEvent": string;
  "journalModal.addEventCta": string;
  "journalModal.eventName": string;
  "journalModal.forecast": string;
  "journalModal.actual": string;
  "journalModal.actualPlaceholder": string;
  "journalModal.impactLow": string;
  "journalModal.impactMedium": string;
  "journalModal.impactHigh": string;
  "journalModal.marketConditions": string;
  "journalModal.marketConditionsPlaceholder": string;
  "journalModal.keyLevels": string;
  "journalModal.keyLevelsPlaceholder": string;
  "journalModal.execution": string;
  "journalModal.disciplineRating": string;
  "journalModal.strategiesPlayed": string;
  "journalModal.psychology": string;
  "journalModal.mentalState": string;
  "journalModal.mistakes": string;
  "journalModal.lessons": string;
  "journalModal.lessonsPlaceholder": string;
  "journalModal.actualResult": string;
  "journalModal.netPnl": string;
  "journalModal.tradesList": string;
  "journalModal.noTrades": string;

  // ─── Trade Entry Modal ──────────────────────────────────────
  "tradeModal.newTrade": string;
  "tradeModal.editTrade": string;
  "tradeModal.editTradeTitle": string;
  "tradeModal.wizardTitle": string;
  "tradeModal.close": string;
  "tradeModal.step": string;
  "tradeModal.step1": string;
  "tradeModal.step1Helper": string;
  "tradeModal.step2": string;
  "tradeModal.step2Helper": string;
  "tradeModal.step3": string;
  "tradeModal.step3Helper": string;
  "tradeModal.step4": string;
  "tradeModal.step4Helper": string;
  "tradeModal.step5": string;
  "tradeModal.step5Helper": string;

  // ─── Trade Import Modal ─────────────────────────────────────
  "importModal.title": string;
  "importModal.description": string;
  "importModal.close": string;
  "importModal.source": string;
  "importModal.file": string;
  "importModal.chooseFile": string;
  "importModal.reading": string;
  "importModal.analyzing": string;
  "importModal.preview": string;
  "importModal.previewTitle": string;
  "importModal.previewDesc": string;
  "importModal.previewEmpty": string;
  "importModal.summary": string;
  "importModal.linesDetected": string;
  "importModal.readyToImport": string;
  "importModal.duplicates": string;
  "importModal.errors": string;
  "importModal.noErrors": string;
  "importModal.importing": string;
  "importModal.importBtn": string;
  "importModal.cTraderHelper": string;
  "importModal.mtHelper": string;
  "importModal.tableRow": string;
  "importModal.tableTrade": string;
  "importModal.tablePrice": string;
  "importModal.tableDates": string;
  "importModal.tableNet": string;
  "importModal.tableStatus": string;
  "importModal.qty": string;
  "importModal.fees": string;
  "importModal.in": string;
  "importModal.out": string;
  "importModal.errorTitle": string;
  "importModal.dupSourceId": string;
  "importModal.dupFingerprint": string;
  "importModal.dupSameFile": string;
  "importModal.dupReady": string;
  "importModal.mismatchFile": string;
  "importModal.selectAccount": string;
  "importModal.addFileFirst": string;
  "importModal.readError": string;

  // ─── Trade Detail ───────────────────────────────────────────
  "tradeDetail.title": string;
  "tradeDetail.subtitle": string;
  "tradeDetail.backJournal": string;
  "tradeDetail.editTrade": string;
  "tradeDetail.notFound": string;
  "tradeDetail.openedOn": string;
  "tradeDetail.closedOn": string;
  "tradeDetail.execution": string;
  "tradeDetail.entryPrice": string;
  "tradeDetail.exitPrice": string;
  "tradeDetail.quantity": string;
  "tradeDetail.fees": string;
  "tradeDetail.stopLoss": string;
  "tradeDetail.takeProfit": string;
  "tradeDetail.riskAmount": string;
  "tradeDetail.contractMultiplier": string;
  "tradeDetail.contextStrategy": string;
  "tradeDetail.confluences": string;
  "tradeDetail.entryReason": string;
  "tradeDetail.exitReason": string;
  "tradeDetail.analysisPsychology": string;
  "tradeDetail.executionRating": string;
  "tradeDetail.planFollowed": string;
  "tradeDetail.emotionalState": string;
  "tradeDetail.lessonLearned": string;
  "tradeDetail.notes": string;
  "tradeDetail.screenshots": string;
  "tradeDetail.noScreenshots": string;
  "tradeDetail.yes": string;
  "tradeDetail.no": string;

  // Removed duplicate block

  // ─── Common ─────────────────────────────────────────────────
  "common.trades": string;
  "common.trade": string;
  "common.loading": string;
  "common.error": string;

  // ─── Footer ─────────────────────────────────────────────────
  "footer.description": string;
  "footer.links.product": string;
  "footer.links.about": string;
  "footer.links.features": string;
  "footer.links.legal": string;
  "footer.links.privacy": string;
  "footer.links.terms": string;
  "footer.rights": string;
};
