import Assistant from './pages/Assistant';
import Dashboard from './pages/Dashboard';
import HealthScanner from './pages/HealthScanner';
import Home from './pages/Home';
import ImageUploader from './pages/ImageUploader';
import MyGarden from './pages/MyGarden';
import PlantLibrary from './pages/PlantLibrary';
import PlantingAlerts from './pages/PlantingAlerts';
import RequestPlant from './pages/RequestPlant';
import Upgrade from './pages/Upgrade';
import Calendar from './pages/Calendar';
import Profile from './pages/Profile';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Assistant": Assistant,
    "Dashboard": Dashboard,
    "HealthScanner": HealthScanner,
    "Home": Home,
    "ImageUploader": ImageUploader,
    "MyGarden": MyGarden,
    "PlantLibrary": PlantLibrary,
    "PlantingAlerts": PlantingAlerts,
    "RequestPlant": RequestPlant,
    "Upgrade": Upgrade,
    "Calendar": Calendar,
    "Profile": Profile,
}

export const pagesConfig = {
    mainPage: "Dashboard",
    Pages: PAGES,
    Layout: __Layout,
};