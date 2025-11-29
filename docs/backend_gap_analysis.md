# Backend Gap Analysis: Indian PHC Context

## Overview
This document compares the current backend implementation against the specific requirements for Indian Primary Health Centres (PHCs) outlined in the context documentation.

## 1. Offline Functionality & Sync
-   **Requirement**: "The system should be designed to work offline... and automatically sync all collected data."
-   **Current Status**: REST API designed for real-time online access.
-   **Gap**: Missing a synchronization mechanism for offline-first mobile apps.
-   **Recommendation**: Implement a `/sync` endpoint in `patient-service` that accepts a batch of records with timestamps to handle offline data uploads.

## 2. Roles & Personnel
-   **Requirement**: "Frontline Worker Integration (ASHAs/ANMs)..."
-   **Current Status**: Roles supported: `HOSPITAL_ADMIN`, `DOCTOR`, `NURSE`.
-   **Gap**: Missing `ASHA` (Accredited Social Health Activist) role.
-   **Recommendation**: Add `ASHA` to the `Role` enum in the database schema.

## 3. ABDM Integration (Ayushman Bharat)
-   **Requirement**: "Seamlessly integrate with ABDM... creation and linking of ABHA IDs."
-   **Current Status**: No specific fields for national IDs.
-   **Gap**: Missing `abhaId` field in Patient records.
-   **Recommendation**: Add `abhaId` (string, unique) to the `Patient` model in `tenant.prisma`.

## 4. Non-Communicable Diseases (NCDs)
-   **Requirement**: Focus on NCDs like hypertension and diabetes.
-   **Current Status**: Basic `Vitals` model (BP, Temperature).
-   **Gap**: Limited fields for specific NCD screening (e.g., Blood Sugar, BMI).
-   **Recommendation**: Expand `Vitals` model or create `NCDScreening` model to capture Blood Sugar (Random/Fasting) and Waist Circumference.

## 5. Multilingual Support
-   **Requirement**: "Multilingual interface is vital."
-   **Current Status**: Backend is language-agnostic but error messages are English-only.
-   **Gap**: No standardized error code system for frontend localization.
-   **Recommendation**: Ensure API returns standard error codes (e.g., `ERR_USER_EXISTS`) so the frontend can map them to local languages.

## Proposed Immediate Actions
1.  Update `User` role enum to include `ASHA`.
2.  Update `Patient` schema to include `abhaId`.
3.  Update `Vitals` schema to include `bloodSugar`.
