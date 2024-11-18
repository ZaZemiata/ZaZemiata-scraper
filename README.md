# ZaZemiata

## Installation - SQLite

1. git clone 
2. cd ZaZemiata
3. npm install
4. Set up `.env` file with the following content:
```
DATABASE_URL="file:./dev.db"
```
5. npm run prisma:migrate
6. npm run build
7. npm start