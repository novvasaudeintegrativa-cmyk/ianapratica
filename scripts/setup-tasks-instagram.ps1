$ErrorActionPreference = "Stop"
$Python = "C:\Users\Anderson\AppData\Local\Python\pythoncore-3.14-64\python.exe"
$Project = "C:\Users\Anderson\Documents\IanaPratica"
$Script = "scripts\publish_instagram.py"

$Posts = @(
  @{ Name="IANaPratica-F02"; Date="2026-09-08"; Media="Instagram\Feed\F02\slides\slide-1.jpeg";  Cap="Instagram\Feed\F02\caption.txt" }
  @{ Name="IANaPratica-R02"; Date="2026-09-10"; Media="Instagram\Reels\R02\reels.mp4";           Cap="Instagram\Reels\R02\caption.txt" }
  @{ Name="IANaPratica-F03"; Date="2026-09-15"; Media="Instagram\Feed\F03\slides\slide-1.jpeg";  Cap="Instagram\Feed\F03\caption.txt" }
  @{ Name="IANaPratica-R03"; Date="2026-09-17"; Media="Instagram\Reels\R03\reels.mp4";           Cap="Instagram\Reels\R03\caption.txt" }
  @{ Name="IANaPratica-F04"; Date="2026-09-22"; Media="Instagram\Feed\F04\slides\slide-1.jpeg";  Cap="Instagram\Feed\F04\caption.txt" }
  @{ Name="IANaPratica-R04"; Date="2026-09-24"; Media="Instagram\Reels\R04\reels.mp4";           Cap="Instagram\Reels\R04\caption.txt" }
  @{ Name="IANaPratica-F05"; Date="2026-09-29"; Media="Instagram\Feed\F05\slides\slide-1.jpeg";  Cap="Instagram\Feed\F05\caption.txt" }
  @{ Name="IANaPratica-R05"; Date="2026-10-01"; Media="Instagram\Reels\R05\reels.mp4";           Cap="Instagram\Reels\R05\caption.txt" }
  @{ Name="IANaPratica-F06"; Date="2026-10-06"; Media="Instagram\Feed\F06\slides\slide-1.jpeg";  Cap="Instagram\Feed\F06\caption.txt" }
  @{ Name="IANaPratica-R06"; Date="2026-10-08"; Media="Instagram\Reels\R06\reels.mp4";           Cap="Instagram\Reels\R06\caption.txt" }
  @{ Name="IANaPratica-F07"; Date="2026-10-13"; Media="Instagram\Feed\F07\slides\slide-1.jpeg";  Cap="Instagram\Feed\F07\caption.txt" }
  @{ Name="IANaPratica-R07"; Date="2026-10-15"; Media="Instagram\Reels\R07\reels.mp4";           Cap="Instagram\Reels\R07\caption.txt" }
)

foreach ($p in $Posts) {
  $when = Get-Date -Date "$($p.Date)T09:00:00"
  $mediaFull = Join-Path $Project $p.Media
  $capFull   = Join-Path $Project $p.Cap
  $argList = "`"$Script`" --images `"$mediaFull`" --caption-file `"$capFull`""

  $action  = New-ScheduledTaskAction -Execute $Python -Argument $argList -WorkingDirectory $Project
  $trigger = New-ScheduledTaskTrigger -Once -At $when
  $settings = New-ScheduledTaskSettingsSet -StartWhenAvailable -DontStopOnIdleEnd -ExecutionTimeLimit (New-TimeSpan -Minutes 15)

  Register-ScheduledTask -TaskName $p.Name -Action $action -Trigger $trigger -Settings $settings -Description "Publicacao automatica Instagram - Imersao IA na Pratica" -Force | Out-Null
  Write-Output "Criada: $($p.Name) -> $when"
}
