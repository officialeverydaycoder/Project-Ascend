# Project Ascend v0.0.1 Pre-release

**A free, offline-first desktop application built exclusively for JEE Main and JEE Advanced aspirants.**

## Overview

Project Ascend is a comprehensive study management platform designed to eliminate the need for multiple disconnected tools during JEE preparation. From daily task tracking and Pomodoro-based focus sessions to AI-powered rank estimation and a curated resource library, everything a serious aspirant needs is consolidated into a single, distraction-free desktop environment.

This is the first public pre-release. The application is fully functional and ready for daily use. Feedback from this release will directly shape future updates.

## Why Project Ascend

JEE preparation demands months of sustained, structured effort. Most aspirants manage their schedule across multiple apps, notebooks, and browser tabs, a fragmented system that costs time and focus. Project Ascend was built to solve this. Every feature in the application exists for a specific reason, informed by the real demands of JEE preparation.

The application runs entirely offline. No account is required. No data ever leaves your machine. Your study data is stored locally and persists across sessions.

## Features

### Dashboard
The dashboard provides a complete at-a-glance overview of your preparation status. It displays your active streak, recent study sessions, task completion rates, and mock test performance trends, all in one place. The streak system tracks consecutive days of logged activity, providing a simple but effective accountability mechanism.
<img width="1919" height="1079" alt="image" src="https://github.com/user-attachments/assets/4f50ce46-f962-496c-8cc4-32e4c40bc8fd" />

### Weekly Planner
The weekly planner allows you to map out your study schedule across all three subjects, Physics, Chemistry, and Mathematics. You can allocate time blocks to specific topics, set daily targets, and monitor your adherence to the plan over the course of the week. The planner resets every Monday and maintains a history of past weeks for reference.
<img width="1919" height="470" alt="image" src="https://github.com/user-attachments/assets/570c9dc6-6789-454e-9c8c-830c22139bbd" />

### Task Tracker
The task tracker operates at the topic level. You can create tasks for individual chapters or concepts, assign them to a subject, set priority levels, and mark them complete as you progress. Tasks can be filtered by subject, priority, and completion status. The tracker gives you a clear picture of what has been covered and what still needs attention.
<img width="1919" height="757" alt="image" src="https://github.com/user-attachments/assets/322837b7-9379-42f9-9348-cff1c07d53a2" />

### Pomodoro Timer
The built-in timer implements the Pomodoro technique, a time management method that alternates between focused work intervals and short breaks. The default configuration is 25 minutes of focused study followed by a 5 minute break, with both intervals fully configurable from the settings page. Session history is logged automatically, allowing you to track total focused study time over days and weeks.
<img width="1919" height="642" alt="image" src="https://github.com/user-attachments/assets/86901dab-7b27-4139-b210-6c5e88b8547f" />

### Mock Logger
The mock logger is designed for aspirants who regularly attempt full-length or subject-wise mock tests. For each mock, you can log the date, subjects attempted, scores, time taken, and personal notes. The logger calculates your accuracy, marks per minute, and subject-wise performance breakdown automatically. Over time it builds a detailed performance history that helps identify patterns, weak areas, and improvement trends.
<img width="1919" height="1079" alt="image" src="https://github.com/user-attachments/assets/5fb66322-f58b-4686-8879-e8300d9a0adc" />

### Rank Estimator
The rank estimator uses a multi-model engine to predict your expected JEE Main and JEE Advanced rank based on your percentile or raw score. It runs seven independent models, three sequence-to-sequence language models via the Hugging Face Inference API and four calibrated statistical models derived from real JEE Main 2023 and 2024 rank data. The final estimate is a trimmed mean consensus across all seven models, designed to filter out outliers and produce a reliable central estimate. Category and gender-based rank adjustments are fully supported. The statistical models function entirely offline and the language models require a free Hugging Face API key.
<img width="1919" height="1079" alt="image" src="https://github.com/user-attachments/assets/b8864726-1ba4-4f0f-86d3-d36601161f96" />

### Resource Hub
The resource hub is a curated library of free, verified study resources for JEE preparation. It comes pre-loaded with links to official JEE Advanced past papers, subject-wise revision notes, practice papers, sample papers, important questions, official NTA mock tests, the SATHEE free crash course by IIT Kanpur, and selected YouTube channels for video lectures. You can add your own resources, tag them by subject, and annotate them with personal notes.
<img width="1919" height="1079" alt="Screenshot 2026-03-18 020610" src="https://github.com/user-attachments/assets/12670e58-acc0-4c5c-b502-c44b4d8c0534" />
<img width="1919" height="1079" alt="Screenshot 2026-03-18 020959" src="https://github.com/user-attachments/assets/d877835d-35a9-4c60-9c48-5656b606f666" />

### Smart Alarms
The alarm system allows you to set multiple named study reminders that fire at specified times. Notifications are delivered at the system level via Windows Toast Notifications, bypassing Focus Assist and Do Not Disturb modes to ensure alarms are never missed during study sessions. A fallback notification mechanism is in place for environments where the primary delivery method is unavailable.
<img width="1919" height="1079" alt="image" src="https://github.com/user-attachments/assets/295146ed-c6fc-4b9c-b324-f4153a0228d0" />

## Installation

1. Download `Project-Ascend-Setup.exe` from the assets section below
2. Run the installer
3. If Windows displays a SmartScreen prompt, click **More info** and then **Run anyway**. This is expected for newly published applications that have not yet accumulated reputation with Microsoft's SmartScreen service. The application contains no malicious code.
4. Follow the on-screen installation instructions
5. Launch Project Ascend from the desktop shortcut or Start Menu entry

## System Requirements

| Requirement | Minimum |
|---|---|
| Operating System | Windows 10 or Windows 11 (64-bit) |
| Storage | 200 MB available disk space |
| RAM | 256 MB |
| Internet | Required only for Rank Estimator (HF models) and Resource Hub links |

## Known Limitations in This Pre-release

- The Rank Estimator language models require a free Hugging Face API key to activate. The statistical models function without any key and are enabled by default.
- This release is Windows only. macOS and Linux builds are not available at this time.
- As this is a pre-release, some UI elements and features may change in subsequent versions based on user feedback.

## Reporting Issues

If you encounter a bug, unexpected behavior, or have a feature suggestion, please open an issue via the Issues tab of this repository. Include a description of the problem, the steps to reproduce it, and your Windows version.

## Upcoming

- Cloud sync for study data across devices
- JEE Advanced specific analytics
- Offline rank estimation improvements
- Performance optimizations and UI refinements

## License

Project Ascend is free to use. All rights reserved.

Project Ascend is built for aspirants who are serious about their preparation. It will always be free.

**Full Changelog**: https://github.com/officialeverydaycoder/Project-Ascend/commits/vProject-Ascend-0.0.1