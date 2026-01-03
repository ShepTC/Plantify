import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import PlantLibrary from './pages/PlantLibrary';
import MyGarden from './pages/MyGarden';
import Calendar from './pages/Calendar';
import PlantingAlerts from './pages/PlantingAlerts';
import Assistant from './pages/Assistant';
import HealthScanner from './pages/HealthScanner';
import Upgrade from './pages/Upgrade';
import ImageUploader from './pages/ImageUploader';
import RequestPlant from './pages/RequestPlant';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Dashboard": Dashboard,
    "Profile": Profile,
    "PlantLibrary": PlantLibrary,
    "MyGarden": MyGarden,
    "Calendar": Calendar,
    "PlantingAlerts": PlantingAlerts,
    "Assistant": Assistant,
    "HealthScanner": HealthScanner,
    "Upgrade": Upgrade,
    "ImageUploader": ImageUploader,
    "RequestPlant": RequestPlant,
}

export const pagesConfig = {
    mainPage: "Dashboard",
    Pages: PAGES,
    Layout: __Layout,
};