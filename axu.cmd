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
echo  5. 打开文章文件夹
echo  6. 退出
echo.
set /p choice="请选择 (1-6): "

if "%choice%"=="1" goto NEW
if "%choice%"=="2" goto EDIT
if "%choice%"=="3" goto SERVER
if "%choice%"=="4" goto PUBLISH
if "%choice%"=="5" goto EXPLORER
if "%choice%"=="6" goto EXIT
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

:EXPLORER
start "" "source\_posts"
goto MENU

:EXIT
echo 再见！
timeout /t 2 >nul
