@echo off
echo Mengirim update ke GitHub...
git add .
git commit -m "update website"
git push
echo.
echo Selesai! Website di GitHub Pages sedang diperbarui otomatis.
pause
