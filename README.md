# Flight Reservation System – Group 3

CMPE341 Database Design and Management – Atılım University, 2026-2027 Fall
Supervisor: Ercüment Aydın

## Ekip

| Üye | Görev |
|---|---|
| Ahmet Bekir MAHMAT | _(doldurun)_ |
| Mehmet Yusuf KAVAK | Docker, PostgreSQL init, GitHub & Dokümantasyon |
| Uğur TURHAN | _(doldurun)_ |
| Yener TOPAL | _(doldurun)_ |

## Uygulama Adresi

- **Canlı:** http://<PUBLIC_IP>  _(domain alındıysa: http://<DOMAIN>)_
- **Lokal:** http://localhost

## Test Hesapları

| Rol | E-posta | Şifre |
|---|---|---|
| Administrator | admin@mail.com | admin123 |
| Customer | ali.yilmaz@mail.com | ali123 |
| Customer | zeynep.kaya@mail.com | zeynep123 |
| Customer | emre.demir@mail.com | emre123 |

Şifreler veritabanında **bcrypt** hash olarak saklanır (`db/init.sql`).

## Çalıştırma

Gereksinim: Docker + Docker Compose

    git clone https://github.com/MehmetYusufKavak/flight-reservation-system-group-3.git
    cd flight-reservation-system-group-3
    cp .env.example .env
    docker compose up -d --build

Bu komut tek seferde PostgreSQL'i tablolar + örnek verilerle ve web uygulamasını ayağa kaldırır.

Veritabanını sıfırlayıp `init.sql`'i yeniden çalıştırmak için:

    docker compose down -v
    docker compose up -d --build

Veritabanına bağlanmak için:

    docker exec -it flight_db psql -U flight_user -d flight_reservation

## Proje Yapısı

    .
    ├── backend/            # API (Auth + CRUD) ve Dockerfile
    ├── db/init.sql         # CREATE TABLE + örnek veri (Rapor Chapter 5)
    ├── docker-compose.yml
    ├── .env.example
    └── README.md

## Veritabanı

7 tablo: `"User"`, `Passenger`, `Airport`, `Flight`, `Seat`, `Reservation`, `Payment`.
Roller: `Customer`, `Administrator`.

## API Endpoint'leri

_(1. kişi dolduracak / Swagger linki)_
