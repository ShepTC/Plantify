import Assistant from './pages/Assistant';
import Calendar from './pages/Calendar';
import HealthScanner from './pages/HealthScanner';
import Home from './pages/Home';
import ImageUploader from './pages/ImageUploader';
import Profile from './pages/Profile';
import Upgrade from './pages/Upgrade';
import Dashboard from './pages/Dashboard';
import MyGarden from './pages/MyGarden';
import PlantingAlerts from './pages/PlantingAlerts';
import RequestPlant from './pages/RequestPlant';
import PlantLibrary from './pages/PlantLibrary';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Assistant": Assistant,
    "Calendar": Calendar,
    "HealthScanner": HealthScanner,
    "Home": Home,
    "ImageUploader": ImageUploader,
    "Profile": Profile,
    "Upgrade": Upgrade,
    "Dashboard": Dashboard,
    "MyGarden": MyGarden,
    "PlantingAlerts": PlantingAlerts,
    "RequestPlant": RequestPlant,
    "PlantLibrary": PlantLibrary,
}

export const pagesConfig = {
    mainPage: "Dashboard",
    Pages: PAGES,
    Layout: __Layout,
};