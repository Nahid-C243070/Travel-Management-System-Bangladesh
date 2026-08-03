CREATE DATABASE IF NOT EXISTS travel_management_bd
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE travel_management_bd;

SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS activity_logs;
DROP TABLE IF EXISTS user_milestones;
DROP TABLE IF EXISTS route_recommendation_logs;
DROP TABLE IF EXISTS guide_bookings;
DROP TABLE IF EXISTS trip_plan_stops;
DROP TABLE IF EXISTS trip_plans;
DROP TABLE IF EXISTS travel_guides;
DROP TABLE IF EXISTS vehicles;
DROP TABLE IF EXISTS spot_ratings;
DROP TABLE IF EXISTS spot_images;
DROP TABLE IF EXISTS tourist_spot_categories;
DROP TABLE IF EXISTS tourist_spots;
DROP TABLE IF EXISTS spot_categories;
DROP TABLE IF EXISTS districts;
DROP TABLE IF EXISTS divisions;
DROP TABLE IF EXISTS refresh_tokens;
DROP TABLE IF EXISTS users;
SET FOREIGN_KEY_CHECKS = 1;

CREATE TABLE users (
  id CHAR(36) PRIMARY KEY,
  full_name VARCHAR(150) NOT NULL,
  email VARCHAR(190) NOT NULL,
  phone VARCHAR(30) NULL,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('ADMIN', 'USER', 'GUIDE') NOT NULL DEFAULT 'USER',
  status ENUM('ACTIVE', 'INACTIVE', 'SUSPENDED') NOT NULL DEFAULT 'ACTIVE',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT uq_users_email UNIQUE (email),
  CONSTRAINT uq_users_phone UNIQUE (phone)
) ENGINE=InnoDB;

CREATE TABLE refresh_tokens (
  id CHAR(36) PRIMARY KEY,
  user_id CHAR(36) NOT NULL,
  token_hash CHAR(64) NOT NULL,
  expires_at DATETIME NOT NULL,
  revoked_at DATETIME NULL,
  ip_address VARCHAR(64) NULL,
  user_agent VARCHAR(255) NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT uq_refresh_token_hash UNIQUE (token_hash),
  CONSTRAINT fk_refresh_tokens_user
    FOREIGN KEY (user_id) REFERENCES users(id)
    ON UPDATE CASCADE ON DELETE CASCADE,
  INDEX idx_refresh_tokens_user (user_id),
  INDEX idx_refresh_tokens_expiry (expires_at)
) ENGINE=InnoDB;

CREATE TABLE divisions (
  id CHAR(36) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  bn_name VARCHAR(100) NULL,
  CONSTRAINT uq_divisions_name UNIQUE (name)
) ENGINE=InnoDB;

CREATE TABLE districts (
  id CHAR(36) PRIMARY KEY,
  division_id CHAR(36) NOT NULL,
  name VARCHAR(100) NOT NULL,
  bn_name VARCHAR(100) NULL,
  CONSTRAINT uq_district_division UNIQUE (division_id, name),
  CONSTRAINT fk_districts_division
    FOREIGN KEY (division_id) REFERENCES divisions(id)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  INDEX idx_districts_division (division_id)
) ENGINE=InnoDB;

CREATE TABLE spot_categories (
  id CHAR(36) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(120) NOT NULL,
  description VARCHAR(500) NULL,
  icon VARCHAR(100) NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT uq_spot_categories_name UNIQUE (name),
  CONSTRAINT uq_spot_categories_slug UNIQUE (slug)
) ENGINE=InnoDB;

CREATE TABLE tourist_spots (
  id CHAR(36) PRIMARY KEY,
  name VARCHAR(180) NOT NULL,
  slug VARCHAR(200) NOT NULL,
  short_description VARCHAR(500) NULL,
  description TEXT NOT NULL,
  district_id CHAR(36) NOT NULL,
  latitude DECIMAL(10,7) NOT NULL,
  longitude DECIMAL(10,7) NOT NULL,
  entry_fee DECIMAL(10,2) NOT NULL DEFAULT 0,
  average_visit_minutes SMALLINT UNSIGNED NOT NULL DEFAULT 120,
  best_season VARCHAR(120) NULL,
  opening_time TIME NULL,
  closing_time TIME NULL,
  rating_average DECIMAL(3,2) NOT NULL DEFAULT 0,
  rating_count INT UNSIGNED NOT NULL DEFAULT 0,
  is_new TINYINT(1) NOT NULL DEFAULT 0,
  is_featured TINYINT(1) NOT NULL DEFAULT 0,
  status ENUM('ACTIVE', 'INACTIVE', 'ARCHIVED') NOT NULL DEFAULT 'ACTIVE',
  created_by CHAR(36) NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT uq_tourist_spots_slug UNIQUE (slug),
  CONSTRAINT chk_spot_latitude CHECK (latitude BETWEEN -90 AND 90),
  CONSTRAINT chk_spot_longitude CHECK (longitude BETWEEN -180 AND 180),
  CONSTRAINT chk_spot_entry_fee CHECK (entry_fee >= 0),
  CONSTRAINT chk_spot_rating CHECK (rating_average BETWEEN 0 AND 5),
  CONSTRAINT fk_tourist_spots_district
    FOREIGN KEY (district_id) REFERENCES districts(id)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT fk_tourist_spots_creator
    FOREIGN KEY (created_by) REFERENCES users(id)
    ON UPDATE CASCADE ON DELETE SET NULL,
  INDEX idx_spots_district (district_id),
  INDEX idx_spots_rating (rating_average),
  INDEX idx_spots_new_featured (is_new, is_featured),
  FULLTEXT INDEX ftx_spots_search (name, short_description, description)
) ENGINE=InnoDB;

CREATE TABLE tourist_spot_categories (
  spot_id CHAR(36) NOT NULL,
  category_id CHAR(36) NOT NULL,
  PRIMARY KEY (spot_id, category_id),
  CONSTRAINT fk_spot_categories_spot
    FOREIGN KEY (spot_id) REFERENCES tourist_spots(id)
    ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT fk_spot_categories_category
    FOREIGN KEY (category_id) REFERENCES spot_categories(id)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  INDEX idx_tourist_spot_categories_category (category_id)
) ENGINE=InnoDB;

CREATE TABLE spot_images (
  id CHAR(36) PRIMARY KEY,
  spot_id CHAR(36) NOT NULL,
  image_url VARCHAR(500) NOT NULL,
  alt_text VARCHAR(255) NULL,
  is_cover TINYINT(1) NOT NULL DEFAULT 0,
  display_order SMALLINT UNSIGNED NOT NULL DEFAULT 0,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_spot_images_spot
    FOREIGN KEY (spot_id) REFERENCES tourist_spots(id)
    ON UPDATE CASCADE ON DELETE CASCADE,
  INDEX idx_spot_images_spot_order (spot_id, display_order)
) ENGINE=InnoDB;

CREATE TABLE spot_ratings (
  id CHAR(36) PRIMARY KEY,
  spot_id CHAR(36) NOT NULL,
  user_id CHAR(36) NOT NULL,
  rating TINYINT UNSIGNED NOT NULL,
  review TEXT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT uq_spot_user_rating UNIQUE (spot_id, user_id),
  CONSTRAINT chk_spot_rating_value CHECK (rating BETWEEN 1 AND 5),
  CONSTRAINT fk_spot_ratings_spot
    FOREIGN KEY (spot_id) REFERENCES tourist_spots(id)
    ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT fk_spot_ratings_user
    FOREIGN KEY (user_id) REFERENCES users(id)
    ON UPDATE CASCADE ON DELETE CASCADE,
  INDEX idx_spot_ratings_user (user_id)
) ENGINE=InnoDB;

CREATE TABLE vehicles (
  id CHAR(36) PRIMARY KEY,
  district_id CHAR(36) NULL,
  name VARCHAR(120) NOT NULL,
  vehicle_type ENUM('BUS', 'MICROBUS', 'CAR', 'CNG', 'MOTORBIKE', 'BOAT', 'TRAIN') NOT NULL,
  description VARCHAR(500) NULL,
  capacity SMALLINT UNSIGNED NOT NULL,
  base_fare DECIMAL(10,2) NOT NULL DEFAULT 0,
  per_km_rate DECIMAL(10,2) NOT NULL DEFAULT 0,
  per_minute_rate DECIMAL(10,2) NOT NULL DEFAULT 0,
  average_speed_kmph DECIMAL(6,2) NOT NULL DEFAULT 25,
  eco_score TINYINT UNSIGNED NOT NULL DEFAULT 50,
  status ENUM('ACTIVE', 'INACTIVE') NOT NULL DEFAULT 'ACTIVE',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT chk_vehicle_capacity CHECK (capacity > 0),
  CONSTRAINT chk_vehicle_fares CHECK (base_fare >= 0 AND per_km_rate >= 0 AND per_minute_rate >= 0),
  CONSTRAINT chk_vehicle_eco_score CHECK (eco_score BETWEEN 0 AND 100),
  CONSTRAINT fk_vehicles_district
    FOREIGN KEY (district_id) REFERENCES districts(id)
    ON UPDATE CASCADE ON DELETE SET NULL,
  INDEX idx_vehicles_type_status (vehicle_type, status),
  INDEX idx_vehicles_district (district_id)
) ENGINE=InnoDB;

CREATE TABLE travel_guides (
  id CHAR(36) PRIMARY KEY,
  district_id CHAR(36) NOT NULL,
  full_name VARCHAR(150) NOT NULL,
  phone VARCHAR(30) NOT NULL,
  email VARCHAR(190) NULL,
  bio TEXT NULL,
  languages VARCHAR(255) NOT NULL DEFAULT 'Bangla',
  experience_years SMALLINT UNSIGNED NOT NULL DEFAULT 0,
  daily_rate DECIMAL(10,2) NOT NULL,
  rating_average DECIMAL(3,2) NOT NULL DEFAULT 0,
  rating_count INT UNSIGNED NOT NULL DEFAULT 0,
  license_number VARCHAR(100) NULL,
  photo_url VARCHAR(500) NULL,
  status ENUM('ACTIVE', 'INACTIVE', 'SUSPENDED') NOT NULL DEFAULT 'ACTIVE',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT uq_guides_phone UNIQUE (phone),
  CONSTRAINT uq_guides_email UNIQUE (email),
  CONSTRAINT uq_guides_license UNIQUE (license_number),
  CONSTRAINT chk_guide_daily_rate CHECK (daily_rate >= 0),
  CONSTRAINT chk_guide_rating CHECK (rating_average BETWEEN 0 AND 5),
  CONSTRAINT fk_guides_district
    FOREIGN KEY (district_id) REFERENCES districts(id)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  INDEX idx_guides_district_status (district_id, status)
) ENGINE=InnoDB;

CREATE TABLE trip_plans (
  id CHAR(36) PRIMARY KEY,
  user_id CHAR(36) NOT NULL,
  vehicle_id CHAR(36) NULL,
  guide_id CHAR(36) NULL,
  title VARCHAR(180) NOT NULL,
  start_latitude DECIMAL(10,7) NOT NULL,
  start_longitude DECIMAL(10,7) NOT NULL,
  start_address VARCHAR(500) NULL,
  start_date DATE NULL,
  end_date DATE NULL,
  status ENUM('PLANNED', 'ONGOING', 'COMPLETED', 'CANCELLED') NOT NULL DEFAULT 'PLANNED',
  total_distance_km DECIMAL(10,2) NOT NULL DEFAULT 0,
  estimated_cost DECIMAL(12,2) NOT NULL DEFAULT 0,
  actual_cost DECIMAL(12,2) NULL,
  notes TEXT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT chk_trip_dates CHECK (end_date IS NULL OR start_date IS NULL OR end_date >= start_date),
  CONSTRAINT chk_trip_costs CHECK (estimated_cost >= 0 AND (actual_cost IS NULL OR actual_cost >= 0)),
  CONSTRAINT fk_trip_plans_user
    FOREIGN KEY (user_id) REFERENCES users(id)
    ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT fk_trip_plans_vehicle
    FOREIGN KEY (vehicle_id) REFERENCES vehicles(id)
    ON UPDATE CASCADE ON DELETE SET NULL,
  CONSTRAINT fk_trip_plans_guide
    FOREIGN KEY (guide_id) REFERENCES travel_guides(id)
    ON UPDATE CASCADE ON DELETE SET NULL,
  INDEX idx_trip_plans_user_status (user_id, status),
  INDEX idx_trip_plans_dates (start_date, end_date)
) ENGINE=InnoDB;

CREATE TABLE trip_plan_stops (
  id CHAR(36) PRIMARY KEY,
  trip_plan_id CHAR(36) NOT NULL,
  spot_id CHAR(36) NOT NULL,
  stop_order SMALLINT UNSIGNED NOT NULL,
  planned_arrival DATETIME NULL,
  planned_departure DATETIME NULL,
  segment_distance_km DECIMAL(10,2) NOT NULL DEFAULT 0,
  notes VARCHAR(500) NULL,
  status ENUM('PENDING', 'VISITED', 'SKIPPED') NOT NULL DEFAULT 'PENDING',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT uq_trip_stop_order UNIQUE (trip_plan_id, stop_order),
  CONSTRAINT uq_trip_stop_spot UNIQUE (trip_plan_id, spot_id),
  CONSTRAINT chk_stop_departure CHECK (planned_departure IS NULL OR planned_arrival IS NULL OR planned_departure >= planned_arrival),
  CONSTRAINT fk_trip_stops_trip
    FOREIGN KEY (trip_plan_id) REFERENCES trip_plans(id)
    ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT fk_trip_stops_spot
    FOREIGN KEY (spot_id) REFERENCES tourist_spots(id)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  INDEX idx_trip_stops_spot (spot_id)
) ENGINE=InnoDB;

CREATE TABLE guide_bookings (
  id CHAR(36) PRIMARY KEY,
  guide_id CHAR(36) NOT NULL,
  user_id CHAR(36) NOT NULL,
  trip_plan_id CHAR(36) NULL,
  booking_date DATE NOT NULL,
  days SMALLINT UNSIGNED NOT NULL DEFAULT 1,
  total_amount DECIMAL(12,2) NOT NULL,
  status ENUM('PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED') NOT NULL DEFAULT 'PENDING',
  notes VARCHAR(500) NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT chk_guide_booking_days CHECK (days > 0),
  CONSTRAINT chk_guide_booking_total CHECK (total_amount >= 0),
  CONSTRAINT fk_guide_bookings_guide
    FOREIGN KEY (guide_id) REFERENCES travel_guides(id)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT fk_guide_bookings_user
    FOREIGN KEY (user_id) REFERENCES users(id)
    ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT fk_guide_bookings_trip
    FOREIGN KEY (trip_plan_id) REFERENCES trip_plans(id)
    ON UPDATE CASCADE ON DELETE SET NULL,
  INDEX idx_guide_bookings_guide_date (guide_id, booking_date),
  INDEX idx_guide_bookings_user (user_id)
) ENGINE=InnoDB;

CREATE TABLE route_recommendation_logs (
  id CHAR(36) PRIMARY KEY,
  user_id CHAR(36) NULL,
  district_id CHAR(36) NULL,
  start_latitude DECIMAL(10,7) NOT NULL,
  start_longitude DECIMAL(10,7) NOT NULL,
  strategy ENUM('balanced', 'fastest', 'scenic', 'budget') NOT NULL DEFAULT 'balanced',
  total_distance_km DECIMAL(10,2) NOT NULL DEFAULT 0,
  estimated_cost DECIMAL(12,2) NOT NULL DEFAULT 0,
  spot_count SMALLINT UNSIGNED NOT NULL DEFAULT 0,
  request_payload JSON NULL,
  response_summary JSON NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_route_logs_user
    FOREIGN KEY (user_id) REFERENCES users(id)
    ON UPDATE CASCADE ON DELETE SET NULL,
  CONSTRAINT fk_route_logs_district
    FOREIGN KEY (district_id) REFERENCES districts(id)
    ON UPDATE CASCADE ON DELETE SET NULL,
  INDEX idx_route_logs_created (created_at),
  INDEX idx_route_logs_strategy (strategy),
  INDEX idx_route_logs_user (user_id)
) ENGINE=InnoDB;

CREATE TABLE user_milestones (
  id CHAR(36) PRIMARY KEY,
  user_id CHAR(36) NOT NULL,
  completed_trips INT UNSIGNED NOT NULL DEFAULT 0,
  visited_spots INT UNSIGNED NOT NULL DEFAULT 0,
  total_distance_km DECIMAL(12,2) NOT NULL DEFAULT 0,
  badges JSON NULL,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT uq_user_milestones_user UNIQUE (user_id),
  CONSTRAINT fk_user_milestones_user
    FOREIGN KEY (user_id) REFERENCES users(id)
    ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE activity_logs (
  id CHAR(36) PRIMARY KEY,
  user_id CHAR(36) NULL,
  action VARCHAR(100) NOT NULL,
  entity_type VARCHAR(100) NULL,
  entity_id CHAR(36) NULL,
  method VARCHAR(10) NULL,
  endpoint VARCHAR(255) NULL,
  status_code SMALLINT UNSIGNED NULL,
  ip_address VARCHAR(64) NULL,
  user_agent VARCHAR(255) NULL,
  details JSON NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_activity_logs_user
    FOREIGN KEY (user_id) REFERENCES users(id)
    ON UPDATE CASCADE ON DELETE SET NULL,
  INDEX idx_activity_logs_created (created_at),
  INDEX idx_activity_logs_user (user_id),
  INDEX idx_activity_logs_action (action),
  INDEX idx_activity_logs_status (status_code)
) ENGINE=InnoDB;
