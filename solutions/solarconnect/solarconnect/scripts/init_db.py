#!/usr/bin/env python3
"""
Database initialization script for SolarConnectAI
"""
import os
import sys
import logging
from sqlalchemy import create_engine, text
from sqlalchemy.exc import SQLAlchemyError

# Setup logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Get database URL from environment
DB_URL = os.environ.get("DATABASE_URL", "postgresql://postgres:postgres@db:5432/solarconnect")

def init_db():
    """Initialize the database with required tables and initial data"""
    try:
        # Create engine
        engine = create_engine(DB_URL)
        
        # Create tables
        with engine.connect() as conn:
            # Create schema if it doesn't exist
            conn.execute(text("CREATE SCHEMA IF NOT EXISTS solarconnect;"))
            
            # Create users table
            conn.execute(text("""
                CREATE TABLE IF NOT EXISTS solarconnect.users (
                    id SERIAL PRIMARY KEY,
                    username VARCHAR(100) UNIQUE NOT NULL,
                    email VARCHAR(255) UNIQUE NOT NULL,
                    full_name VARCHAR(255),
                    hashed_password VARCHAR(255) NOT NULL,
                    is_active BOOLEAN DEFAULT TRUE,
                    is_admin BOOLEAN DEFAULT FALSE,
                    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                    last_login TIMESTAMP WITH TIME ZONE
                );
            """))
            
            # Create leads table
            conn.execute(text("""
                CREATE TABLE IF NOT EXISTS solarconnect.leads (
                    id SERIAL PRIMARY KEY,
                    user_id INTEGER REFERENCES solarconnect.users(id),
                    first_name VARCHAR(100) NOT NULL,
                    last_name VARCHAR(100) NOT NULL,
                    email VARCHAR(255),
                    phone VARCHAR(20),
                    address TEXT NOT NULL,
                    property_type VARCHAR(50),
                    lead_source VARCHAR(100),
                    lead_score FLOAT,
                    status VARCHAR(50) DEFAULT 'new',
                    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
                );
            """))
            
            # Create properties table
            conn.execute(text("""
                CREATE TABLE IF NOT EXISTS solarconnect.properties (
                    id SERIAL PRIMARY KEY,
                    lead_id INTEGER REFERENCES solarconnect.leads(id),
                    address TEXT NOT NULL,
                    latitude FLOAT,
                    longitude FLOAT,
                    roof_area FLOAT,
                    roof_pitch FLOAT,
                    azimuth FLOAT,
                    shading_factor FLOAT,
                    estimated_production FLOAT,
                    satellite_image_path VARCHAR(255),
                    analysis_complete BOOLEAN DEFAULT FALSE,
                    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                    analyzed_at TIMESTAMP WITH TIME ZONE
                );
            """))
            
            # Create proposals table
            conn.execute(text("""
                CREATE TABLE IF NOT EXISTS solarconnect.proposals (
                    id SERIAL PRIMARY KEY,
                    lead_id INTEGER REFERENCES solarconnect.leads(id),
                    property_id INTEGER REFERENCES solarconnect.properties(id),
                    system_size FLOAT NOT NULL,
                    panel_count INTEGER NOT NULL,
                    panel_type VARCHAR(100),
                    inverter_type VARCHAR(100),
                    estimated_production FLOAT,
                    estimated_savings FLOAT,
                    proposal_path VARCHAR(255),
                    status VARCHAR(50) DEFAULT 'draft',
                    created_by INTEGER REFERENCES solarconnect.users(id),
                    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
                );
            """))
            
            # Create site_assessments table
            conn.execute(text("""
                CREATE TABLE IF NOT EXISTS solarconnect.site_assessments (
                    id SERIAL PRIMARY KEY,
                    property_id INTEGER REFERENCES solarconnect.properties(id),
                    assessment_type VARCHAR(50) NOT NULL,
                    assessment_date TIMESTAMP WITH TIME ZONE,
                    assessor_id INTEGER REFERENCES solarconnect.users(id),
                    photos_path VARCHAR(255),
                    notes TEXT,
                    measurements JSONB,
                    status VARCHAR(50) DEFAULT 'pending',
                    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                    completed_at TIMESTAMP WITH TIME ZONE
                );
            """))
            
            # Commit the transaction
            conn.commit()
        
        logger.info("Database initialized successfully")
        return True
        
    except SQLAlchemyError as e:
        logger.error(f"Database initialization failed: {str(e)}")
        return False

if __name__ == "__main__":
    success = init_db()
    sys.exit(0 if success else 1) 