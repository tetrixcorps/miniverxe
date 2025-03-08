#!/usr/bin/env python3
"""
Script to create an admin user for TaxStreamAI
"""
import os
import sys
import logging
import getpass
from sqlalchemy import create_engine, text
from sqlalchemy.exc import SQLAlchemyError
from passlib.context import CryptContext

# Setup logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Get database URL from environment
DB_URL = os.environ.get("DATABASE_URL", "postgresql://postgres:postgres@db:5432/taxstream")

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def create_admin():
    """Create an admin user in the database"""
    try:
        # Get admin credentials
        username = input("Enter admin username: ")
        email = input("Enter admin email: ")
        full_name = input("Enter admin full name: ")
        password = getpass.getpass("Enter admin password: ")
        confirm_password = getpass.getpass("Confirm admin password: ")
        
        # Validate input
        if not username or not email or not password:
            logger.error("Username, email, and password are required")
            return False
            
        if password != confirm_password:
            logger.error("Passwords do not match")
            return False
        
        # Hash the password
        hashed_password = pwd_context.hash(password)
        
        # Create engine
        engine = create_engine(DB_URL)
        
        # Insert admin user
        with engine.connect() as conn:
            # Check if user already exists
            result = conn.execute(
                text("SELECT id FROM taxstream.users WHERE username = :username OR email = :email"),
                {"username": username, "email": email}
            )
            if result.fetchone():
                logger.error("User with this username or email already exists")
                return False
            
            # Insert new admin user
            conn.execute(
                text("""
                    INSERT INTO taxstream.users 
                    (username, email, full_name, hashed_password, is_active, is_admin, created_at)
                    VALUES (:username, :email, :full_name, :hashed_password, TRUE, TRUE, NOW())
                """),
                {
                    "username": username,
                    "email": email,
                    "full_name": full_name,
                    "hashed_password": hashed_password
                }
            )
            
            # Commit the transaction
            conn.commit()
        
        logger.info(f"Admin user '{username}' created successfully")
        return True
        
    except SQLAlchemyError as e:
        logger.error(f"Failed to create admin user: {str(e)}")
        return False
    except Exception as e:
        logger.error(f"Unexpected error: {str(e)}")
        return False

if __name__ == "__main__":
    success = create_admin()
    sys.exit(0 if success else 1) 