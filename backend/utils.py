import math

def calculate_distance(lat1, lon1, lat2, lon2):
    """
    Calculate distance between two points using Haversine formula
    Returns distance in kilometers
    """
    # Radius of Earth in kilometers
    R = 6371.0

    # Convert latitude and longitude to radians
    lat1_rad = math.radians(lat1)
    lon1_rad = math.radians(lon1)
    lat2_rad = math.radians(lat2)
    lon2_rad = math.radians(lon2)

    # Haversine formula
    dlat = lat2_rad - lat1_rad
    dlon = lon2_rad - lon1_rad

    a = math.sin(dlat / 2)**2 + math.cos(lat1_rad) * math.cos(lat2_rad) * math.sin(dlon / 2)**2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))

    distance = R * c
    return distance

def find_nearest_ngo(user_lat, user_lon, ngos):
    """
    Find the nearest NGO to the user's location
    Returns NGO with added distance field
    """
    nearest_ngo = None
    min_distance = float('inf')

    for ngo in ngos:
        distance = calculate_distance(user_lat, user_lon, ngo['latitude'], ngo['longitude'])
        if distance < min_distance:
            min_distance = distance
            nearest_ngo = ngo.copy()
            nearest_ngo['distance'] = round(distance, 2)

    return nearest_ngo
