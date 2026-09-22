<div align="center">

# 📱 SSI Mobile

**Application mobile — SIM SOMGANDE Information**

[![Expo](https://img.shields.io/badge/Expo-57-000020?style=for-the-badge&logo=expo&logoColor=white)](https://expo.dev)
[![React Native](https://img.shields.io/badge/React_Native-0.86-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://reactnative.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![EAS Build](https://img.shields.io/badge/EAS-Build-4630EB?style=for-the-badge&logo=expo&logoColor=white)](https://expo.dev/eas)

Application mobile pour consulter les programmes, événements et informations
de l'église SIM SOMGANDE — disponible hors ligne, avec notifications push.

[📥 Télécharger l'APK](https://expo.dev/accounts/<ton-compte>/projects/sim-somgande/builds) · [📘 API Docs](https://ssi-backend-two.vercel.app/docs) · [🌐 Dashboard web](https://ssi-dashboard.vercel.app)

</div>

---

## 📖 Sommaire

- [✨ Fonctionnalités](#-fonctionnalités)
- [🏗️ Architecture](#️-architecture)
- [🚀 Démarrage rapide](#-démarrage-rapide)
- [🔧 Configuration](#-configuration)
- [📁 Structure du projet](#-structure-du-projet)
- [🔐 Authentification](#-authentification)
- [💾 Cache offline](#-cache-offline)
- [🔔 Notifications push](#-notifications-push)
- [🎨 Design & Thèmes](#-design--thèmes)
- [📦 Modules](#-modules)
- [🚢 Build & Déploiement](#-build--déploiement)
- [🔄 OTA Updates](#-ota-updates)
- [🧪 Scripts disponibles](#-scripts-disponibles)
- [🌐 Écosystème](#-écosystème)
- [🤝 Contribution](#-contribution)

---

## ✨ Fonctionnalités

### 🎯 Modules de consultation
- **📅 Programmes** — Cultes du dimanche et prières du vendredi, avec sections détaillées (accueil, louange, prédication…) et mise en avant de vos tâches personnelles
- **🎉 Événements** — Mariages, camps, sorties, conférences avec champs adaptés à chaque type
- **📢 Infos** — Annonces et communications de l'église
- **🙏 Prières** — Sujets de prière et veillées
- **🔔 Rappels** — Listes d'éléments à retenir
- **📬 Notifications** — Historique des notifications reçues

### 🚀 Expérience utilisateur
- **🎨 Design premium** — Interface moderne avec animations fluides
- **🔔 Notifications push** — Sons, vibrations, image attachée
- **📡 Mode hors ligne** — Consultation des données déjà chargées sans connexion
- **🎨 4 thèmes** — Nuit bleue, Orange feu, Clair, Bleu océan
- **🔍 Recherche & filtres** — Par statut, type, priorité
- **♿ Accessibilité** — Boutons larges, contrastes élevés

### 📱 Expérience mobile
- **Auto-refresh** — Les données se rafraîchissent automatiquement au retour sur l'app
- **Pull-to-refresh** — Tirer vers le bas pour recharger
- **Deep links** — Tap sur une notification → ouvre l'écran correspondant
- **Splash screen** — Animé et brandé

---

## 🏗️ Architecture
┌──────────────────────────────────────────────────────────────┐
│ TÉLÉPHONE (Expo) │
│ ┌────────────────────────────────────────────────────────┐ │
│ │ React Native 0.86 + Expo Router │ │
│ │ ┌──────────────────┐ ┌────────────────────────────┐ │ │
│ │ │ Screens (Tabs) │ │ Context Providers │ │ │
│ │ │ - programmes │ │ - Auth │ │ │
│ │ │ - evenements │ │ - Theme │ │ │
│ │ │ - infos │ │ - Notifications │ │ │
│ │ │ - prieres │ │ - Alert │ │ │
│ │ │ - rappels │ │ - Onboarding │ │ │
│ │ └──────────────────┘ └────────────────────────────┘ │ │
│ │ │ │ │ │
│ │ ▼ ▼ │ │
│ │ ┌──────────────────┐ ┌────────────────────────────┐ │ │
│ │ │ React Query │ │ AsyncStorage (offline) │ │ │
│ │ │ + Persister │ │ - cache queries │ │ │
│ │ │ │ │ - tokens (SecureStore) │ │ │
│ │ └──────────────────┘ └────────────────────────────┘ │ │
│ │ │ │ │
│ │ ▼ │ │
│ │ ┌──────────────────┐ │ │
│ │ │ Axios Client │ Bearer + X-Client: mobile │ │
│ │ │ (interceptors) │ Refresh auto sur 401 │ │
│ │ └──────────────────┘ │ │
│ └────────────────────────────────────────────────────────┘ │
└──────────────────────────┬───────────────────────────────────┘
│
▼
┌──────────────────────────────┐
│ Backend NestJS (Vercel) │
│ https://ssi-backend-two... │
│ │
│ - Auth JWT │
│ - 9 modules CRUD │
│ - Expo Push Service │
│ - PostgreSQL (Prisma) │
└──────────────────────────────┘
