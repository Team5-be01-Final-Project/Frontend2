#!/usr/bin/env bash

# 스크립트 실행 중 에러 발생 시 중단
set -e

# 터미널 로그 출력 활성화
set -x

# 프로젝트 디렉토리로 이동
cd /home/ubuntu/app/bps

# 생성된 빌드 파일의 소유자 변경
sudo chown -R ubuntu:ubuntu dist

# public 디렉토리의 권한 변경
sudo chmod -R +w public

# Java 애플리케이션 빌드 (필요한 경우 주석 해제)
# ./gradlew bootJar

# Docker Compose를 사용하여 서비스 시작
sudo docker compose -f docker-compose.yml up -d --build --force-recreate
