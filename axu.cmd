@echo off
chcp 65001 >nul
title 阿旭的博客管理工具
cd /d "%~dp0"

:MENU
cls
echo ================================
echo      阿旭的博客管理工具
echo ================================
echo.
echo  1. 写新文章
echo  2. 编辑已有文章
echo  3. 本地预览
echo  4. 发布到 GitHub
echo  5. 打开管理后台 (浏览器编辑)
echo  6. 打开文章文件夹
echo  7. 退出
echo.
set /p choice="请选择 (1-7): "

if "%choice%"=="1" goto NEW
if "%choice%"=="2" goto EDIT
if "%choice%"=="3" goto SERVER
if "%choice%"=="4" goto PUBLISH
if "%choice%"=="5" goto ADMIN
if "%choice%"=="6" goto EXPLORER
if "%choice%"=="7" goto EXIT
goto MENU

:NEW
set /p title="输入文章标题: "
call npx hexo new "%title%"
echo.
echo 文章已创建！按任意键打开文件夹编辑...
pause >nul
start "" "source\_posts"
goto MENU

:EDIT
start "" "source\_posts"
goto MENU

:SERVER
echo 启动本地服务器 (http://localhost:4000)
echo 按 Ctrl+C 停止服务器
call npx hexo server
pause
goto MENU

:PUBLISH
echo 正在发布...
call npx hexo clean && npx hexo generate && npx hexo deploy
if %errorlevel% equ 0 (
    echo.
    echo 发布成功！✅
) else (
    echo.
    echo 发布失败，请检查错误信息 ❌
)
pause
goto MENU

:ADMIN
echo 启动管理后台...
start "BlogAdmin" /min node admin/server.js
timeout /t 2 >nul
start http://localhost:3000
echo.
echo 管理后台已启动: http://localhost:3000
echo 按任意键停止后台服务...
pause >nul
taskkill /fi "WINDOWTITLE eq BlogAdmin*" /f >nul 2>&1
goto MENU

:EXPLORER
start "" "source\_posts"
goto MENU

:EXIT
echo 再见！
timeout /t 2 >nul
