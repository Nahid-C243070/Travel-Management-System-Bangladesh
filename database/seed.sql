USE travel_management_bd;

INSERT INTO users (id, full_name, email, phone, password_hash, role, status)
VALUES
('10000000-0000-4000-8000-000000000001', 'System Administrator', 'admin@travelbd.local', '01700000001', '$2b$10$ugMYNc8fZC/zF9lKlX0cuOKHwC7HPuIJ1wxPOsN9nPo9x6EmOj4LG', 'ADMIN', 'ACTIVE'),
('10000000-0000-4000-8000-000000000002', 'Demo Traveler', 'user@travelbd.local', '01700000002', '$2b$10$Xo20jTSz5dSynXMmHElGR.zO738q6SPXjY.6/OsKjxUV9w98motnC', 'USER', 'ACTIVE')
ON DUPLICATE KEY UPDATE full_name = VALUES(full_name), password_hash = VALUES(password_hash), role = VALUES(role), status = VALUES(status);

INSERT INTO divisions (id, name, bn_name) VALUES
('20000000-0000-4000-8000-000000000001', 'Dhaka', 'ঢাকা'),
('20000000-0000-4000-8000-000000000002', 'Chattogram', 'চট্টগ্রাম'),
('20000000-0000-4000-8000-000000000003', 'Sylhet', 'সিলেট'),
('20000000-0000-4000-8000-000000000004', 'Khulna', 'খুলনা'),
('20000000-0000-4000-8000-000000000005', 'Barishal', 'বরিশাল'),
('20000000-0000-4000-8000-000000000006', 'Rajshahi', 'রাজশাহী'),
('20000000-0000-4000-8000-000000000007', 'Rangpur', 'রংপুর'),
('20000000-0000-4000-8000-000000000008', 'Mymensingh', 'ময়মনসিংহ')
ON DUPLICATE KEY UPDATE bn_name = VALUES(bn_name);

INSERT INTO districts (id, division_id, name, bn_name) VALUES
('21000000-0000-4000-8000-000000000001', '20000000-0000-4000-8000-000000000001', 'Dhaka', 'ঢাকা'),
('21000000-0000-4000-8000-000000000002', '20000000-0000-4000-8000-000000000002', 'Cox''s Bazar', 'কক্সবাজার'),
('21000000-0000-4000-8000-000000000003', '20000000-0000-4000-8000-000000000002', 'Rangamati', 'রাঙামাটি'),
('21000000-0000-4000-8000-000000000004', '20000000-0000-4000-8000-000000000002', 'Chattogram', 'চট্টগ্রাম'),
('21000000-0000-4000-8000-000000000005', '20000000-0000-4000-8000-000000000002', 'Bandarban', 'বান্দরবান'),
('21000000-0000-4000-8000-000000000006', '20000000-0000-4000-8000-000000000003', 'Sylhet', 'সিলেট'),
('21000000-0000-4000-8000-000000000007', '20000000-0000-4000-8000-000000000003', 'Moulvibazar', 'মৌলভীবাজার'),
('21000000-0000-4000-8000-000000000008', '20000000-0000-4000-8000-000000000004', 'Khulna', 'খুলনা'),
('21000000-0000-4000-8000-000000000009', '20000000-0000-4000-8000-000000000004', 'Bagerhat', 'বাগেরহাট'),
('21000000-0000-4000-8000-000000000010', '20000000-0000-4000-8000-000000000005', 'Patuakhali', 'পটুয়াখালী'),
('21000000-0000-4000-8000-000000000011', '20000000-0000-4000-8000-000000000001', 'Narayanganj', 'নারায়ণগঞ্জ'),
('21000000-0000-4000-8000-000000000012', '20000000-0000-4000-8000-000000000006', 'Naogaon', 'নওগাঁ'),
('21000000-0000-4000-8000-000000000013', '20000000-0000-4000-8000-000000000006', 'Bogura', 'বগুড়া')
ON DUPLICATE KEY UPDATE division_id = VALUES(division_id), bn_name = VALUES(bn_name);

INSERT INTO spot_categories (id, name, slug, description, icon) VALUES
('30000000-0000-4000-8000-000000000001', 'Beach', 'beach', 'Sea beaches and coastal attractions', 'waves'),
('30000000-0000-4000-8000-000000000002', 'Hill', 'hill', 'Hills, valleys and elevated viewpoints', 'mountain'),
('30000000-0000-4000-8000-000000000003', 'Forest', 'forest', 'Forests, mangroves and nature reserves', 'trees'),
('30000000-0000-4000-8000-000000000004', 'Heritage', 'heritage', 'Historic, archaeological and architectural places', 'landmark'),
('30000000-0000-4000-8000-000000000005', 'Island', 'island', 'Islands and marine destinations', 'island'),
('30000000-0000-4000-8000-000000000006', 'Tea Garden', 'tea-garden', 'Tea estates and green landscapes', 'leaf'),
('30000000-0000-4000-8000-000000000007', 'Waterfall', 'waterfall', 'Waterfalls, streams and water-based attractions', 'water'),
('30000000-0000-4000-8000-000000000008', 'City Attraction', 'city-attraction', 'Museums, forts and urban landmarks', 'building')
ON DUPLICATE KEY UPDATE description = VALUES(description), icon = VALUES(icon);

INSERT INTO tourist_spots
(id, name, slug, short_description, description, district_id, latitude, longitude, entry_fee,
 average_visit_minutes, best_season, opening_time, closing_time, rating_average, rating_count,
 is_new, is_featured, status, created_by)
VALUES
('40000000-0000-4000-8000-000000000001', 'Cox''s Bazar Sea Beach', 'coxs-bazar-sea-beach', 'The world-famous long natural sandy beach of Bangladesh.', 'A major coastal destination offering sunrise, sunset, seafood, beach activities and access to nearby marine attractions.', '21000000-0000-4000-8000-000000000002', 21.4272000, 91.9798000, 0, 240, 'October to March', '05:00:00', '22:00:00', 4.80, 1, 0, 1, 'ACTIVE', '10000000-0000-4000-8000-000000000001'),
('40000000-0000-4000-8000-000000000002', 'Inani Beach', 'inani-beach', 'A quieter beach known for coral stones and clear water.', 'Located south of Cox''s Bazar, Inani is popular for scenic drives, coral stones, clean shoreline and relaxed coastal views.', '21000000-0000-4000-8000-000000000002', 21.1640000, 92.0488000, 0, 150, 'October to March', '05:30:00', '19:00:00', 4.60, 0, 1, 1, 'ACTIVE', '10000000-0000-4000-8000-000000000001'),
('40000000-0000-4000-8000-000000000003', 'Saint Martin''s Island', 'saint-martins-island', 'Bangladesh''s best-known coral island.', 'A small island in the Bay of Bengal offering marine scenery, beaches, local seafood and boat travel from Teknaf.', '21000000-0000-4000-8000-000000000002', 20.6236000, 92.3226000, 500, 480, 'November to February', '06:00:00', '18:00:00', 4.75, 0, 0, 1, 'ACTIVE', '10000000-0000-4000-8000-000000000001'),
('40000000-0000-4000-8000-000000000004', 'Sajek Valley', 'sajek-valley', 'A hill destination famous for clouds, valleys and sunrise.', 'Sajek Valley provides panoramic hill views, indigenous culture, cloud-covered mornings and scenic road journeys.', '21000000-0000-4000-8000-000000000003', 23.3820000, 92.2938000, 100, 360, 'September to March', '06:00:00', '20:00:00', 4.70, 0, 0, 1, 'ACTIVE', '10000000-0000-4000-8000-000000000001'),
('40000000-0000-4000-8000-000000000005', 'Nilgiri', 'nilgiri-bandarban', 'A high-altitude viewpoint in Bandarban.', 'Nilgiri offers mountain scenery, clouds, sunrise and sunset viewpoints along the Bandarban-Thanchi road.', '21000000-0000-4000-8000-000000000005', 21.9233000, 92.3018000, 200, 180, 'October to March', '06:00:00', '18:00:00', 4.55, 0, 1, 0, 'ACTIVE', '10000000-0000-4000-8000-000000000001'),
('40000000-0000-4000-8000-000000000006', 'Ratargul Swamp Forest', 'ratargul-swamp-forest', 'A freshwater swamp forest near Sylhet.', 'Ratargul is explored mainly by small boats, especially during the monsoon when water covers the forest floor.', '21000000-0000-4000-8000-000000000006', 25.0075000, 91.9281000, 100, 150, 'June to September', '07:00:00', '17:30:00', 4.45, 0, 0, 1, 'ACTIVE', '10000000-0000-4000-8000-000000000001'),
('40000000-0000-4000-8000-000000000007', 'Jaflong', 'jaflong', 'A scenic border area with river, hills and stone beds.', 'Jaflong combines views of the Khasi hills, rivers, tea gardens and local cultural landscapes near the Bangladesh-India border.', '21000000-0000-4000-8000-000000000006', 25.1638000, 92.0179000, 0, 180, 'October to March', '06:00:00', '18:30:00', 4.30, 0, 0, 0, 'ACTIVE', '10000000-0000-4000-8000-000000000001'),
('40000000-0000-4000-8000-000000000008', 'Lawachara National Park', 'lawachara-national-park', 'A tropical forest and wildlife destination in Srimangal.', 'Lawachara National Park is known for forest trails, biodiversity, birds, primates and nearby tea estates.', '21000000-0000-4000-8000-000000000007', 24.3218000, 91.7839000, 115, 180, 'October to March', '08:00:00', '17:00:00', 4.50, 0, 0, 1, 'ACTIVE', '10000000-0000-4000-8000-000000000001'),
('40000000-0000-4000-8000-000000000009', 'Sundarbans', 'sundarbans', 'The world''s largest mangrove forest and a UNESCO World Heritage site.', 'The Bangladesh Sundarbans offers mangrove ecosystems, wildlife, river cruises and guided access through designated routes.', '21000000-0000-4000-8000-000000000009', 22.0750000, 89.2000000, 300, 600, 'November to February', '06:00:00', '18:00:00', 4.85, 0, 0, 1, 'ACTIVE', '10000000-0000-4000-8000-000000000001'),
('40000000-0000-4000-8000-000000000010', 'Kuakata Sea Beach', 'kuakata-sea-beach', 'A coastal destination known for viewing both sunrise and sunset.', 'Kuakata is a wide sandy beach with nearby fishing communities, Buddhist heritage and coastal nature.', '21000000-0000-4000-8000-000000000010', 21.8215000, 90.1196000, 0, 240, 'October to March', '05:00:00', '21:00:00', 4.40, 0, 1, 0, 'ACTIVE', '10000000-0000-4000-8000-000000000001'),
('40000000-0000-4000-8000-000000000011', 'Lalbagh Fort', 'lalbagh-fort', 'A Mughal-era fort complex in Old Dhaka.', 'Lalbagh Fort includes historic structures, gardens, museum displays and significant Mughal architectural remains.', '21000000-0000-4000-8000-000000000001', 23.7189000, 90.3882000, 30, 120, 'October to March', '10:00:00', '17:00:00', 4.35, 0, 0, 1, 'ACTIVE', '10000000-0000-4000-8000-000000000001'),
('40000000-0000-4000-8000-000000000012', 'Ahsan Manzil', 'ahsan-manzil', 'The Pink Palace and museum beside the Buriganga River.', 'Ahsan Manzil is a major historic landmark presenting the heritage of Dhaka''s Nawab family and colonial-era architecture.', '21000000-0000-4000-8000-000000000001', 23.7086000, 90.4060000, 40, 120, 'October to March', '10:30:00', '17:30:00', 4.45, 0, 0, 0, 'ACTIVE', '10000000-0000-4000-8000-000000000001'),
('40000000-0000-4000-8000-000000000013', 'Panam City', 'panam-city', 'A historic merchant settlement in Sonargaon.', 'Panam City contains rows of historic buildings associated with Bengal''s trading history and is close to other Sonargaon attractions.', '21000000-0000-4000-8000-000000000011', 23.6556000, 90.6023000, 30, 150, 'October to March', '09:00:00', '17:00:00', 4.40, 0, 1, 0, 'ACTIVE', '10000000-0000-4000-8000-000000000001'),
('40000000-0000-4000-8000-000000000014', 'Somapura Mahavihara', 'somapura-mahavihara', 'The archaeological ruins of the Buddhist monastery at Paharpur.', 'Somapura Mahavihara is one of South Asia''s most important Buddhist archaeological sites and a UNESCO World Heritage property.', '21000000-0000-4000-8000-000000000012', 25.0310000, 88.9770000, 50, 180, 'October to March', '09:00:00', '17:00:00', 4.65, 0, 0, 1, 'ACTIVE', '10000000-0000-4000-8000-000000000001'),
('40000000-0000-4000-8000-000000000015', 'Mahasthangarh', 'mahasthangarh', 'One of the earliest urban archaeological sites in Bangladesh.', 'Mahasthangarh includes ancient fortifications, archaeological remains, museums and nearby historic locations.', '21000000-0000-4000-8000-000000000013', 24.9616000, 89.3425000, 30, 180, 'October to March', '09:00:00', '17:00:00', 4.35, 0, 1, 0, 'ACTIVE', '10000000-0000-4000-8000-000000000001')
ON DUPLICATE KEY UPDATE description = VALUES(description), rating_average = VALUES(rating_average), is_new = VALUES(is_new), is_featured = VALUES(is_featured), status = VALUES(status);

INSERT IGNORE INTO tourist_spot_categories (spot_id, category_id) VALUES
('40000000-0000-4000-8000-000000000001', '30000000-0000-4000-8000-000000000001'),
('40000000-0000-4000-8000-000000000002', '30000000-0000-4000-8000-000000000001'),
('40000000-0000-4000-8000-000000000003', '30000000-0000-4000-8000-000000000001'),
('40000000-0000-4000-8000-000000000003', '30000000-0000-4000-8000-000000000005'),
('40000000-0000-4000-8000-000000000004', '30000000-0000-4000-8000-000000000002'),
('40000000-0000-4000-8000-000000000005', '30000000-0000-4000-8000-000000000002'),
('40000000-0000-4000-8000-000000000006', '30000000-0000-4000-8000-000000000003'),
('40000000-0000-4000-8000-000000000007', '30000000-0000-4000-8000-000000000002'),
('40000000-0000-4000-8000-000000000008', '30000000-0000-4000-8000-000000000003'),
('40000000-0000-4000-8000-000000000008', '30000000-0000-4000-8000-000000000006'),
('40000000-0000-4000-8000-000000000009', '30000000-0000-4000-8000-000000000003'),
('40000000-0000-4000-8000-000000000010', '30000000-0000-4000-8000-000000000001'),
('40000000-0000-4000-8000-000000000011', '30000000-0000-4000-8000-000000000004'),
('40000000-0000-4000-8000-000000000011', '30000000-0000-4000-8000-000000000008'),
('40000000-0000-4000-8000-000000000012', '30000000-0000-4000-8000-000000000004'),
('40000000-0000-4000-8000-000000000012', '30000000-0000-4000-8000-000000000008'),
('40000000-0000-4000-8000-000000000013', '30000000-0000-4000-8000-000000000004'),
('40000000-0000-4000-8000-000000000014', '30000000-0000-4000-8000-000000000004'),
('40000000-0000-4000-8000-000000000015', '30000000-0000-4000-8000-000000000004');

INSERT INTO spot_images (id, spot_id, image_url, alt_text, is_cover, display_order) VALUES
('41000000-0000-4000-8000-000000000001', '40000000-0000-4000-8000-000000000001', 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e', 'Cox''s Bazar sea beach', 1, 0),
('41000000-0000-4000-8000-000000000002', '40000000-0000-4000-8000-000000000004', 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee', 'Sajek valley hills', 1, 0),
('41000000-0000-4000-8000-000000000003', '40000000-0000-4000-8000-000000000006', 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e', 'Ratargul swamp forest', 1, 0),
('41000000-0000-4000-8000-000000000004', '40000000-0000-4000-8000-000000000009', 'https://images.unsplash.com/photo-1511497584788-876760111969', 'Sundarbans mangrove forest', 1, 0),
('41000000-0000-4000-8000-000000000005', '40000000-0000-4000-8000-000000000011', 'https://images.unsplash.com/photo-1564399579883-451a5d44ec08', 'Historic fort architecture', 1, 0)
ON DUPLICATE KEY UPDATE image_url = VALUES(image_url), alt_text = VALUES(alt_text);

INSERT INTO vehicles
(id, district_id, name, vehicle_type, description, capacity, base_fare, per_km_rate, per_minute_rate, average_speed_kmph, eco_score, status)
VALUES
('50000000-0000-4000-8000-000000000001', NULL, 'Economy Car', 'CAR', 'Comfortable for small groups and city-to-city travel.', 4, 120, 24, 1.20, 38, 55, 'ACTIVE'),
('50000000-0000-4000-8000-000000000002', NULL, 'Family Microbus', 'MICROBUS', 'Suitable for families and medium groups.', 10, 500, 34, 1.50, 36, 45, 'ACTIVE'),
('50000000-0000-4000-8000-000000000003', NULL, 'Intercity Bus', 'BUS', 'Budget-friendly option for large groups and intercity travel.', 40, 1000, 48, 0.80, 34, 72, 'ACTIVE'),
('50000000-0000-4000-8000-000000000004', '21000000-0000-4000-8000-000000000001', 'Dhaka CNG', 'CNG', 'Short-distance urban transport in Dhaka.', 3, 80, 18, 1.00, 25, 60, 'ACTIVE'),
('50000000-0000-4000-8000-000000000005', NULL, 'Motorbike', 'MOTORBIKE', 'Fast option for one traveler with light luggage.', 1, 60, 12, 0.80, 42, 70, 'ACTIVE'),
('50000000-0000-4000-8000-000000000006', '21000000-0000-4000-8000-000000000006', 'Local Tourist Boat', 'BOAT', 'Boat transport for wetland and river-based destinations.', 12, 800, 45, 0.50, 16, 40, 'ACTIVE'),
('50000000-0000-4000-8000-000000000007', NULL, 'Shared Train Coach', 'TRAIN', 'Estimated shared train fare model for route comparison.', 60, 300, 8, 0.20, 55, 90, 'ACTIVE')
ON DUPLICATE KEY UPDATE description = VALUES(description), capacity = VALUES(capacity), base_fare = VALUES(base_fare), per_km_rate = VALUES(per_km_rate), status = VALUES(status);

INSERT INTO travel_guides
(id, district_id, full_name, phone, email, bio, languages, experience_years, daily_rate,
 rating_average, rating_count, license_number, photo_url, status)
VALUES
('60000000-0000-4000-8000-000000000001', '21000000-0000-4000-8000-000000000002', 'Rafiq Hasan', '01810000001', 'rafiq.guide@example.com', 'Coastal and island tour guide for Cox''s Bazar and Teknaf routes.', 'Bangla, English', 7, 2500, 4.70, 24, 'BD-GUIDE-CXB-001', NULL, 'ACTIVE'),
('60000000-0000-4000-8000-000000000002', '21000000-0000-4000-8000-000000000006', 'Nusrat Jahan', '01810000002', 'nusrat.guide@example.com', 'Nature, tea garden and wetland guide in the Sylhet region.', 'Bangla, English, Hindi', 5, 2200, 4.80, 18, 'BD-GUIDE-SYL-002', NULL, 'ACTIVE'),
('60000000-0000-4000-8000-000000000003', '21000000-0000-4000-8000-000000000001', 'Mahmud Karim', '01810000003', 'mahmud.guide@example.com', 'Heritage and architecture guide for Dhaka and Sonargaon.', 'Bangla, English', 9, 2000, 4.60, 31, 'BD-GUIDE-DHK-003', NULL, 'ACTIVE'),
('60000000-0000-4000-8000-000000000004', '21000000-0000-4000-8000-000000000005', 'Aung Marma', '01810000004', 'aung.guide@example.com', 'Hill route and local culture guide for Bandarban.', 'Bangla, English, Marma', 8, 2800, 4.90, 27, 'BD-GUIDE-BAN-004', NULL, 'ACTIVE')
ON DUPLICATE KEY UPDATE bio = VALUES(bio), daily_rate = VALUES(daily_rate), status = VALUES(status);

INSERT INTO spot_ratings (id, spot_id, user_id, rating, review)
VALUES
('70000000-0000-4000-8000-000000000001', '40000000-0000-4000-8000-000000000001', '10000000-0000-4000-8000-000000000002', 5, 'Excellent beach experience and easy route planning.')
ON DUPLICATE KEY UPDATE rating = VALUES(rating), review = VALUES(review), updated_at = NOW();

INSERT INTO trip_plans
(id, user_id, vehicle_id, guide_id, title, start_latitude, start_longitude, start_address,
 start_date, end_date, status, total_distance_km, estimated_cost, actual_cost, notes)
VALUES
('80000000-0000-4000-8000-000000000001', '10000000-0000-4000-8000-000000000002', '50000000-0000-4000-8000-000000000001', '60000000-0000-4000-8000-000000000003', 'Old Dhaka Heritage Day', 23.8103000, 90.4125000, 'Dhaka city centre', CURDATE(), CURDATE(), 'COMPLETED', 18.50, 950, 980, 'Demo completed trip for analytics.')
ON DUPLICATE KEY UPDATE status = VALUES(status), total_distance_km = VALUES(total_distance_km), actual_cost = VALUES(actual_cost);

INSERT INTO trip_plan_stops
(id, trip_plan_id, spot_id, stop_order, segment_distance_km, status)
VALUES
('81000000-0000-4000-8000-000000000001', '80000000-0000-4000-8000-000000000001', '40000000-0000-4000-8000-000000000011', 1, 8.80, 'VISITED'),
('81000000-0000-4000-8000-000000000002', '80000000-0000-4000-8000-000000000001', '40000000-0000-4000-8000-000000000012', 2, 3.20, 'VISITED')
ON DUPLICATE KEY UPDATE segment_distance_km = VALUES(segment_distance_km), status = VALUES(status);

INSERT INTO user_milestones
(id, user_id, completed_trips, visited_spots, total_distance_km, badges)
VALUES
('90000000-0000-4000-8000-000000000001', '10000000-0000-4000-8000-000000000002', 1, 2, 18.50, JSON_ARRAY('FIRST_TRIP'))
ON DUPLICATE KEY UPDATE completed_trips = VALUES(completed_trips), visited_spots = VALUES(visited_spots), total_distance_km = VALUES(total_distance_km), badges = VALUES(badges);

INSERT INTO route_recommendation_logs
(id, user_id, district_id, start_latitude, start_longitude, strategy, total_distance_km, estimated_cost, spot_count, request_payload, response_summary)
VALUES
('91000000-0000-4000-8000-000000000001', '10000000-0000-4000-8000-000000000002', '21000000-0000-4000-8000-000000000001', 23.8103000, 90.4125000, 'balanced', 18.50, 950, 2, JSON_OBJECT('demo', true), JSON_OBJECT('trip', 'Old Dhaka Heritage Day'))
ON DUPLICATE KEY UPDATE total_distance_km = VALUES(total_distance_km), estimated_cost = VALUES(estimated_cost);

UPDATE tourist_spots s
SET s.rating_average = COALESCE((SELECT AVG(r.rating) FROM spot_ratings r WHERE r.spot_id = s.id), s.rating_average),
    s.rating_count = (SELECT COUNT(*) FROM spot_ratings r WHERE r.spot_id = s.id);
